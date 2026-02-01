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

        stage("Backend: Security & Quality Scan") {
            steps {
                dir('backend') {
                    echo "Scanning backend"

                    sh "npm install"

                    dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit --disableAssembly',
                                    odcInstallation: 'DP-Check'

                    sh "trivy fs . --scanners vuln --severity HIGH,CRITICAL --exit-code 0 > trivy-backend-report.txt"

                    withSonarQubeEnv('SonarQube-Server') {
                        sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=mern-backend \
                        -Dsonar.sources=. \
                        -Dsonar.javascript.node.maxspace=4096
                        """
                    }
                }

                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage("Backend: Build & Push Docker Image") {
            steps {
                dir('backend') {
                    sh "docker build -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${IMAGE_TAG} ."
                    sh "docker tag ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest"

                    sh "trivy image ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest --severity HIGH,CRITICAL --exit-code 0 > trivy-backend-image-report.txt"

                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )]) {
                        sh "echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin"
                        sh "docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest"
                    }
                }
            }
        }

        /* ================= FRONTEND ================= */

        stage("Frontend: Security Scan") {
            steps {
                dir('frontend') {
                    echo "Scanning frontend"

                    sh "npm install"

                    dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit --disableAssembly',
                                    odcInstallation: 'DP-Check'

                    sh "trivy fs . --scanners vuln --severity HIGH,CRITICAL --exit-code 0 > trivy-frontend-report.txt"

                    withSonarQubeEnv('SonarQube-Server') {
                        sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=mern-frontend \
                        -Dsonar.sources=. \
                        -Dsonar.javascript.node.maxspace=4096
                        """
                    }
                }
            }
        }

        stage("Frontend: Build & Push Docker Image") {
            steps {
                dir('frontend') {
                    sh "docker build -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${IMAGE_TAG} ."
                    sh "docker tag ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest"

                    sh "trivy image ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest --severity HIGH,CRITICAL --exit-code 0 > trivy-frontend-image-report.txt"

                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )]) {
                        sh "echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin"
                        sh "docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }

        /* ================= DEPLOY ================= */

        stage("Deploy Full Stack") {
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
