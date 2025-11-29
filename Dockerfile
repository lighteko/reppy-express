FROM ubuntu:latest
LABEL authors="h2jun"

ENTRYPOINT ["top", "-b"]
