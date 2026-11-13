#define _XOPEN_SOURCE 700
#include "cjson/cJSON.h"
#include "roxml.h"

#include <ctype.h>
#include <string.h>
#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <time.h>

typedef struct string_dat_s {
    char *string;
    size_t capacity;
    size_t size;
} string_dat_t;

typedef struct xml_doc_s{
	node_t* root;
	node_t* rss;
	node_t* channel;
} xml_doc_t;

void convert_date(const char *input_date, string_dat_t *buf){
struct tm time = {0};
strptime(input_date, "%m/%d/%Y", &time);

time.tm_isdst = -1;
mktime(&time);

strftime(buf->string, buf->capacity, "%a, %d %b %Y %H:%M:%S %z", &time);

}

 bool read_file(const char *file_path, string_dat_t *buffer){

    FILE *json_file = fopen(file_path, "rb");

    if (!json_file){
        fprintf(stderr, "Could not open the JSON file!\n");
        return false;
    }

    while (1){
        int remaining_space = buffer->capacity - buffer->size;

        if (remaining_space <= 0){
            int new_capacity = buffer->capacity * 2;
            char *backup = buffer->string;
            buffer->string = realloc(buffer->string, new_capacity);

            if (!buffer->string){
                buffer->string = backup;
                fprintf(stderr, "Could not reallocate space!\n");
                fclose(json_file);
                return false;
            }

            buffer->capacity = new_capacity;
            remaining_space = buffer->capacity - buffer->size;

        }

        int res = fread(buffer->string + buffer->size, sizeof(char), remaining_space, json_file);

        buffer->size += res;

        if (res < remaining_space){

            if (buffer->size == buffer->capacity){
                char *tmp = realloc(buffer->string, buffer->capacity + 1);

                if (!tmp){
                    fprintf(stderr, "Could not reallocate the 1 additional byte\n");
                    fclose(json_file);
                    return false;
                }

                buffer->string = tmp;
                buffer->capacity += 1;

            }

            buffer->string[buffer->size] = '\0';

            printf("file has been read successfully!\n");
            fclose(json_file);
            break;
        }

    
    }

    return true;
}

void title_to_link(char *title, char *link, size_t buf_size){

    char fmt_link[426];

    size_t title_len = strlen(title);

    for (size_t i = 0; i < title_len; i++){
        char c = tolower(title[i]);

        if (c == ' ') fmt_link[i] = '-';
        else fmt_link[i] = c;

    }

    fmt_link[title_len] = '\0';

    snprintf(link, buf_size, "https://vietexa.com/blog/%s", fmt_link);

}

 // Many thanks to https://git.tkpmonke.com/tkpmonke/rss-generator/src/branch/master/src/main.c for the inspiration
 xml_doc_t prepare_xml_document(char *rss_title, char *rss_link, char *rss_desc, char *rss_lang, char *rss_gen) {
	xml_doc_t doc;

	doc.root = roxml_add_node(NULL, 0, ROXML_PI_NODE, "xml", "version=\"1.0\" encoding=\"UTF-8\"");
	roxml_add_node(doc.root, 0, ROXML_CMT_NODE, NULL, "What are ya' lookin' for, stranger?");

	doc.rss = roxml_add_node(doc.root, 0, ROXML_ELM_NODE, "rss", NULL);
	roxml_add_node(doc.rss, 0, ROXML_ATTR_NODE, "version", "2.0");

	doc.channel = roxml_add_node(doc.rss, 0, ROXML_ELM_NODE, "channel", NULL);
	roxml_add_node(doc.channel, 0, ROXML_ELM_NODE, "title", rss_title);
	roxml_add_node(doc.channel, 0, ROXML_ELM_NODE, "link", rss_link);
	roxml_add_node(doc.channel, 0, ROXML_ELM_NODE, "description", rss_desc);
	roxml_add_node(doc.channel, 0, ROXML_ELM_NODE, "language", rss_lang);
	roxml_add_node(doc.channel, 0, ROXML_ELM_NODE, "generator", rss_gen);

	return doc;
}


int main(void){

    string_dat_t site_json_file_buf = {0};
    site_json_file_buf.capacity = 124;
    site_json_file_buf.string = calloc(site_json_file_buf.capacity, sizeof(*site_json_file_buf.string));

    string_dat_t config_json_file_buf = {0};
    config_json_file_buf.capacity = 124;
    config_json_file_buf.string = calloc(config_json_file_buf.capacity, sizeof(*config_json_file_buf.string));

     printf("Parsing config JSON file...\n");

    if(!read_file("config.json", &config_json_file_buf)){
        fprintf(stderr, "There was an error reading the config.json file!\n");
        return 1;
    }

    printf("Parsing site JSON file...\n");

    if(!read_file("../../host/blog/blog_index.json", &site_json_file_buf)){
        fprintf(stderr, "There was an error reading the site json file!\n");
        return 1;
    }

    cJSON *config_json = cJSON_Parse(config_json_file_buf.string);
    cJSON *site_json = cJSON_Parse(site_json_file_buf.string);

    cJSON *json_title = cJSON_GetObjectItemCaseSensitive(config_json, "title");
    cJSON *json_link = cJSON_GetObjectItemCaseSensitive(config_json, "link");
    cJSON *json_desc = cJSON_GetObjectItemCaseSensitive(config_json, "desc");
    cJSON *json_lang = cJSON_GetObjectItemCaseSensitive(config_json, "lang");
    cJSON *json_gen = cJSON_GetObjectItemCaseSensitive(config_json, "gen");

    if(!cJSON_IsString(json_title)
     ||!cJSON_IsString(json_link)
     ||!cJSON_IsString(json_desc)
     ||!cJSON_IsString(json_lang) 
     ||!cJSON_IsString(json_gen)){
        fprintf(stderr,"Well, fuck... One of them is not a string!\n");
        return 1;
     }

    xml_doc_t xml_doc = prepare_xml_document(
        json_title->valuestring,
        json_link->valuestring,
        json_desc->valuestring,
        json_lang->valuestring,
        json_gen->valuestring
    );

    cJSON *blogs = cJSON_GetObjectItemCaseSensitive(site_json, "blogs");
    cJSON *blog = NULL;

    cJSON_ArrayForEach(blog, blogs){

        cJSON *blog_title = cJSON_GetObjectItemCaseSensitive(blog, "title");
        cJSON *blog_description = cJSON_GetObjectItemCaseSensitive(blog, "description");
        cJSON *blog_date = cJSON_GetObjectItemCaseSensitive(blog, "date");

        if(!cJSON_IsString(blog_title)
        ||!cJSON_IsString(blog_description) 
        ||!cJSON_IsString(blog_date)){
            fprintf(stderr,"Well, fuck... Inside the array loop one of them is not a string!\n");
            return 1;
        }

        string_dat_t date_buf = {0};
        date_buf.capacity = 64;
        date_buf.string = calloc(date_buf.capacity, sizeof(*date_buf.string));

        convert_date(blog_date->valuestring, &date_buf);

        char link_buf[426];

        title_to_link(blog_title->valuestring, link_buf, sizeof(link_buf));

        node_t *item = roxml_add_node(xml_doc.channel,0, ROXML_ELM_NODE, "item", NULL);

        roxml_add_node(item,0, ROXML_ELM_NODE, "title", blog_title->valuestring);
        roxml_add_node(item,0, ROXML_ELM_NODE, "description", blog_description->valuestring);
        roxml_add_node(item,0, ROXML_ELM_NODE, "link", link_buf);
        roxml_add_node(item,0, ROXML_ELM_NODE, "guid", link_buf);
        roxml_add_node(item,0, ROXML_ELM_NODE, "pubDate", date_buf.string);

        free(date_buf.string);

    }

    roxml_commit_file(xml_doc.root,"feed.xml",1);

    free(site_json_file_buf.string);
    free(config_json_file_buf.string);

    roxml_close(xml_doc.root);
    cJSON_Delete(config_json);
    cJSON_Delete(site_json);

}