#!/usr/bin/env groovy 

node {
    deleteDir()
    withEnv(["ON_K8S=true"]) {
        sh "git clone --depth 1 https://github.com/SAP/cloud-s4-sdk-pipeline.git pipelines"
        load './pipelines/s4sdk-pipeline.groovy'
    }
}
