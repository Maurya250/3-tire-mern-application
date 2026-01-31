# 3-Tier MERN Application – DevSecOps CI/CD Pipeline

This project demonstrates a real-world DevSecOps CI/CD pipeline for a 3-Tier MERN Application using Jenkins, Docker, SonarQube, Trivy, and OWASP Dependency-Check.

The pipeline automates code checkout, security scanning, quality analysis, Docker image build & push, and full-stack deployment.

---

## Architecture Overview

Frontend:
- React.js
- Dockerized

Backend:
- Node.js + Express
- MongoDB (containerized)

CI/CD & DevSecOps:
- Jenkins
- SonarQube (Code Quality & Quality Gate)
- Trivy (Filesystem & Image Scan)
- OWASP Dependency-Check
- Docker & Docker Hub

---

## Project Structure

3-tire-mern-application/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── Jenkinsfile
└── README.md

---

## Prerequisites

System:
- Ubuntu 20.04 / 22.04
- Minimum 4 GB RAM (8 GB recommended)

Tools:
- Docker
- Jenkins
- Git
- SonarQube (separate instance recommended)

---

## Step-by-Step Setup

### 1. Install Docker
sudo apt update  
sudo apt install -y docker.io  
sudo usermod -aG docker $USER  
newgrp docker  

---

### 2. Install Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null  

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null  

sudo apt update  
sudo apt install -y jenkins  
sudo systemctl start jenkins  

Access Jenkins:
http://<JENKINS-IP>:8080

---

### 3. Configure Jenkins Tools

NodeJS:
- Install NodeJS Plugin
- Name: node18
- Version: NodeJS 18.x

SonarQube Scanner:
- Install SonarQube Scanner for Jenkins
- Name: sonar-scanner

---

### 4. Setup SonarQube Server

docker run -d --name sonarqube -p 9000:9000 sonarqube:lts  

Login:
username: admin  
password: admin  

---

### 5. Configure SonarQube in Jenkins

Manage Jenkins → Configure System → SonarQube servers

- Name: SonarQube-Server
- Server URL: http://<SONARQUBE-IP>:9000
- Authentication Token: SonarQube token

---

### 6. Configure SonarQube Webhook

SonarQube UI:
Administration → Configuration → Webhooks → Create

Webhook URL:
http://<JENKINS-IP>:8080/sonarqube-webhook/

---

### 7. Docker Hub Credentials

Manage Jenkins → Credentials

- Kind: Username with password
- ID: docker-hub-creds
- Docker Hub username & password

---

## CI/CD Pipeline Flow

1. Workspace cleanup & code checkout  
2. npm install  
3. OWASP Dependency-Check scan  
4. Trivy filesystem scan  
5. SonarQube analysis with Quality Gate  
6. Docker image build  
7. Trivy image scan  
8. Push images to Docker Hub  
9. Deploy full MERN stack using Docker  

---

## Deployment

Containers:
- MongoDB
- Backend API
- Frontend UI

Access:
- Frontend: http://<SERVER-IP>
- Backend API: http://<SERVER-IP>:5000

---

## Security & Quality

- SonarQube Quality Gate enforced
- Trivy HIGH & CRITICAL vulnerabilities reported
- OWASP Dependency-Check reports archived in Jenkins

---

## Key Learnings

- Real-world DevSecOps CI/CD pipeline
- Secure containerized application delivery
- Jenkins + SonarQube integration
- Security scanning in CI pipelines
- Docker-based microservice deployment

---

## Future Improvements

- Kubernetes deployment
- Helm charts
- GitHub PR quality gates
- Monitoring with Prometheus & Grafana

---

## Author

Aniket Maurya  
DevOps | CI/CD | Cloud | DevSecOps

If you find this project useful, consider giving it a star ⭐
