**Lesson Plan: GitLab CI/CD for DevOps Engineers**

---

### ✈️ Overview

This lesson introduces GitLab CI/CD to students who are already familiar with GitHub Actions. The goal is to teach GitLab as a full DevOps platform, including CI/CD pipelines, environments, runners, and self-hosted setup.

---

### 📚 Lesson Objectives

By the end of this lesson, students will be able to:

- Understand key differences between GitLab CI/CD and GitHub Actions
- Write and run `.gitlab-ci.yml` pipelines
- Use GitLab Runners to execute jobs
- Build and deploy applications using GitLab's built-in Docker registry
- Enable Review Apps
- Install and configure self-hosted GitLab CE

---

### 🖥️ Part 0: GitLab CE Self-Hosting

**Important:** Avoid using `gitlab.example.com` in production or test setups unless you configure DNS or `/etc/hosts`. For testing, replace it with your server's IP or real domain.

Example:

```bash
EXTERNAL_URL="http://192.168.1.100" sudo apt install gitlab-ce
```

Or, if using a domain:

```bash
EXTERNAL_URL="http://gitlab.mycompany.uz" sudo apt install gitlab-ce
```

**Supported OS and Requirements:**

- **OS:** Ubuntu 20.04 or 22.04 (recommended)
- **CPU:** 4 cores minimum (8+ recommended)
- **RAM:** 4 GB minimum (8+ recommended)
- **Disk:** 20 GB minimum (100+ GB recommended for active usage)

**Steps to install GitLab CE on Ubuntu Server:**

1. Install required dependencies:

   ```bash
   sudo apt update && sudo apt install -y curl openssh-server ca-certificates tzdata perl
   ```

2. Add GitLab repository and install GitLab:

   ```bash
   curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash
   EXTERNAL_URL=\"http://gitlab.mirafzal.uz\" sudo apt install gitlab-ce
   ```

3. Reconfigure GitLab:

   ```bash
   sudo gitlab-ctl reconfigure
   ```

4. Access GitLab via browser at `http://gitlab.mirafzal.uz` and set root password.

**Optional:** Configure SSL using Let’s Encrypt or a reverse proxy.

---

### 🧱 GitLab CE Architecture (Core Components)

```
+--------------------+       +-------------------------+
|    Nginx           |<----->|     Developer Browser   |
+--------------------+       +-------------------------+
        |
        v
+--------------------+
| GitLab Workhorse   |  Handles uploads & Git requests
+--------------------+
        |
        v
+--------------------+
|     Rails App      |  GitLab core logic (API/UI)
+--------------------+
        |
        v
+--------------------+
|    Sidekiq         |  Background jobs
+--------------------+
        |
  +-----+------+-----+
  |            |     
  v            v
Redis       PostgreSQL
Cache       DB storage

        +
        |
        v
+--------------------+
|      Gitaly        |  Git repository access
+--------------------+
        |
        v
+--------------------+
|    Git Repos       |
+--------------------+

Optional: Prometheus & Grafana for monitoring
```

### 🗺️ GitLab & Runner Architecture Diagram

```
+---------------------+           +---------------------------+
|  Developer Laptop   |  Pushes   |     GitLab Server (CE)    |
|                     +---------->+   - Git Repos             |
| - Git CLI/VSCode    |           |   - CI/CD Pipelines       |
+---------------------+           |   - Container Registry    |
                                  +------------+--------------+
                                               |
                                               | Triggers
                                               v
                                 +-------------+--------------+
                                 |       GitLab Runner        |
                                 |  - Executes CI/CD jobs     |
                                 |  - Docker, Shell, etc.     |
                                 +----------------------------+
```

---

### ⚖️ GitHub Actions vs GitLab CI/CD Comparison

| Feature                | GitHub Actions                 | GitLab CI/CD                              |
| ---------------------- | ------------------------------ | ----------------------------------------- |
| YAML File Location     | `.github/workflows/*.yml`      | `.gitlab-ci.yml` (single root-level file) |
| Pipeline Structure     | `jobs:`                        | `stages:` with jobs inside each stage     |
| Runner Setup           | GitHub-hosted or self-hosted   | GitLab shared or custom runners           |
| Docker Support         | Requires marketplace actions   | Built-in with GitLab Container Registry   |
| Environments           | Manual configuration           | Built-in with dynamic Review Apps         |
| Secrets/Variables      | Repository-level               | Project/Group level with masking          |
| Matrix Builds          | `strategy.matrix`              | `parallel:` or `rules:` with variables    |
| Security Tools         | CodeQL, 3rd-party integrations | Built-in SAST/DAST/Dependency scanning    |
| Self-Hosted Git Server | No                             | Yes (GitLab CE/EE)                        |

---

### ✍️ Part 1: Hello World CI/CD Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test

build_job:
  stage: build
  script:
    - echo "Building project..."

unit_tests:
  stage: test
  script:
    - echo "Running unit tests..."
```

**Exercise:** Students should push this to a GitLab project and observe pipeline execution.

---

### 🛠️ Part 2: GitLab Runner Setup

**Steps:**

1. Create a VM (Ubuntu)
2. Install GitLab Runner:
   ```bash
   curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
   sudo apt-get install gitlab-runner
   ```
3. Register runner:
   ```bash
   sudo gitlab-runner register
   ```
   Provide GitLab URL and token (from project CI/CD settings)

**Result:** Students now run jobs on their own runner.

---

### 📃 Part 3: Docker Build and Deploy

```yaml
image: docker:latest

services:
  - docker:dind

stages:
  - build
  - deploy

variables:
  DOCKER_TLS_CERTDIR: ""

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:latest .
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker push $CI_REGISTRY_IMAGE:latest
```

**Exercise:**

- Create GitLab container registry
- Push app Docker image

---

### 🌍 Part 4: Review Apps

```yaml
review:
  stage: deploy
  script:
    - echo "Deploying to review-$CI_COMMIT_REF_NAME"
  environment:
    name: review/$CI_COMMIT_REF_NAME
    url: https://$CI_COMMIT_REF_NAME.example.com
    on_stop: stop_review

stop_review:
  stage: deploy
  script:
    - echo "Stopping environment"
  environment:
    name: review/$CI_COMMIT_REF_NAME
    action: stop
  when: manual
```

**Goal:** Deploy per-branch environments.

---

### 🔹 Wrap-Up

- GitLab CI/CD is a full DevOps platform with deeper integrations
- Runners and pipelines are more customizable
- GitLab provides registry, review apps, and self-hosting options

---

### 📆 Homework

- Migrate a GitHub Actions workflow to GitLab CI for any previous project
- Set up GitLab Runner and push a container image to the GitLab registry
- Bonus: Add Review App deployment or install GitLab CE on your VM

---

**End of Lesson**

