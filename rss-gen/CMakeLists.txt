cmake_minimum_required(VERSION 3.30)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
project(rss-gen LANGUAGES C)

add_executable(rss-gen src/main.c)

if (CMAKE_BUILD_TYPE STREQUAL "Debug")
target_compile_options(rss-gen PRIVATE -Wall -Wextra -g -Wpedantic -fsanitize=address,undefined)
target_link_options(rss-gen PRIVATE -fsanitize=address,undefined)
endif()

add_subdirectory(vendored)

target_include_directories(rss-gen PRIVATE ${CMAKE_SOURCE_DIR}/vendored/libroxml/src/)

target_link_libraries(rss-gen PRIVATE roxml-static cjson)