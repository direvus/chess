#!/usr/bin/env python3
# coding: utf-8


def lambda_handler(event, context):
    print(event)
    response = {'statusCode': 200, 'body': 'Connected.'}
    return response
