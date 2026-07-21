pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "pankhaniyanishant/khodiyar-enterprise-backend:latest"
        FRONTEND_IMAGE = "pankhaniyanishant/khodiyar-enterprise-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker build -t $BACKEND_IMAGE .'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('client') {
                    sh 'docker build -t $FRONTEND_IMAGE .'
                }
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Push Backend') {
            steps {
                sh 'docker push $BACKEND_IMAGE'
            }
        }

        stage('Push Frontend') {
            steps {
                sh 'docker push $FRONTEND_IMAGE'
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }
}
