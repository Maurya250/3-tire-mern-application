pipeline {
    agent any

    tools {
        nodejs 'node18'
    }

    environment {
        DOCKERHUB_USERNAME = "maurya250"
        BACKEND_IMAGE = "mern-backend"
        FRONTEND_IMAGE = "mern-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        SCANNER_HOME = tool 'sonar-scanner'
    }

    stages {

        stage("Cleanup & Checkout") {
            steps {
                cleanWs()
                checkout scm
                echo "Code checkout done automatically via SCM"
            }
        }

        /* ================= BACKEND ================= */

        stage("Backend: security & quality scan") {
            steps {
                dir('backend') {
                    echo "processing backend code"

                    sh "npm install"

                    dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit',
                                    odcInstallation: 'DP-Check'

                    sh "trivy fs . --severity HIGH,CRITICAL --exit-code 0 > trivy-backend-report.txt"

                    withSonarQubeEnv('SonarQube-Server') {
                        sh "${SCANNER_HOME}/bin/sonar-scanner -Dsonar.projectKey=mern-backend -Dsonar.sources=."
                    }

                    timeout(time: 2, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }

        stage("Backend: build & push docker image") {
            steps {
                dir('backend') {
                    sh "docker build -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${IMAGE_TAG} ."
                    sh "docker build -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest ."

                    sh "trivy image ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest --severity HIGH,CRITICAL --exit-code 0 > trivy-backend-image-report.txt"

                    withCredentials([usernamePassword(credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD')]) {

                        sh "echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin"
                        sh "docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest"
                    }
                }
            }
        }

        /* ================= FRONTEND ================= */

        stage("Frontend: security & quality scan") {
            steps {
                dir('frontend') {
                    echo "processing frontend code"

                    sh "npm install"

                    dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit',
                                    odcInstallation: 'DP-Check'

                    sh "trivy fs . --severity HIGH,CRITICAL --exit-code 0 > trivy-frontend-report.txt"

                    withSonarQubeEnv('SonarQube-Server') {
                        sh "${SCANNER_HOME}/bin/sonar-scanner -Dsonar.projectKey=mern-frontend -Dsonar.sources=."
                    }

                    timeout(time: 2, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }

        stage("Frontend: build & push docker image") {
            steps {
                dir('frontend') {
                    sh "docker build -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${IMAGE_TAG} ."
                    sh "docker build -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest ."

                    sh "trivy image ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest --severity HIGH,CRITICAL --exit-code 0 > trivy-frontend-image-report.txt"

                    withCredentials([usernamePassword(credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD')]) {

                        sh "echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin"
                        sh "docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage("Deploy full stack") {
            steps {
                script {
                    sh "docker network create mern-network || true"
                    sh "docker rm -f mongodb backend frontend || true"

                    sh "docker run -d --name mongodb --network mern-network mongo:latest"

                    sh """
                    docker run -d -p 5000:5000 --name backend --network mern-network \
                    -e MONGODB_URI=mongodb://mongodb:27017/mern_db \
                    ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest
                    """

                    sh """
                    docker run -d -p 80:80 --name frontend --network mern-network \
                    -e REACT_APP_BACKEND_URL=http://localhost:5000 \
                    ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }
    }

    post {
        always {
            dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            archiveArtifacts artifacts: '**/trivy-*-report.txt', allowEmptyArchive: true
            sh "docker logout || true"
        }
    }
}
