# PLEASE READ

## Getting Started

Clone the repository and install all dependencies:

```bash
npm install
```

## Development Workflow

Before starting any work, make sure you are working on your respective development branch and push all your changes there.

### Development Branches

- `dev-zubayer`
- `dev-shohag`
- `dev-nayon`
- `dev-zisan`

> **Do not commit directly to the `dev` or `main` branch.**

## Final Step

After completing your work:

1. Push your latest changes to your own development branch.
2. Discuss and review the changes with the team.
3. Merge your branch into the `dev` branch after discussion.

# Git Commands

## Clone the Repository

```bash
git clone https://github.com/AhmadZubayer/Emergency-Disaster-Response-Management-System-APWT.git
```

---

## Go Inside the Project

```bash
cd Emergency-Disaster-Response-Management-System-APWT
```

---

## Install Dependencies

```bash
npm install
```

---

## Check Current Branch

```bash
git branch
```

---

## View All Branches

```bash
git branch -a
```

---

## Create the Development Branches (Repository Owner)

```bash
git checkout -b dev
git push -u origin dev

git checkout main

git checkout -b dev-zubayer
git push -u origin dev-zubayer

git checkout main

git checkout -b dev-shohag
git push -u origin dev-shohag

git checkout main

git checkout -b dev-nayon
git push -u origin dev-nayon

git checkout main

git checkout -b dev-zisan
git push -u origin dev-zisan
```

---

# Daily Workflow

## Switch to Your Branch

```bash
git switch dev-zubayer
```

---

## Pull Latest Changes

```bash
git pull origin dev-zubayer
```

---

## Check Status

```bash
git status
```

---

## Stage All Changes

```bash
git add .
```

---

## Commit

```bash
git commit -m "Your commit message"
```

Example

```bash
git commit -m "Implemented authentication module"
```

---

## Push Your Changes

```bash
git push origin dev-zubayer
```

---

## View Commit History

```bash
git log --oneline
```

---

## See File Differences

```bash
git diff
```

---

## Undo Changes Before Staging

```bash
git restore .
```

---

## Unstage Files

```bash
git restore --staged .
```

---

# Merge into dev

## Switch to dev

```bash
git switch dev
```

---

## Pull Latest dev

```bash
git pull origin dev
```

---

## Merge a Developer Branch

```bash
git merge dev-zubayer
```

Repeat for others:

```bash
git merge dev-shohag
git merge dev-nayon
git merge dev-zisan
```

---

## Push Updated dev

```bash
git push origin dev
```

---

# Update Your Branch After dev Changes

```bash
git switch dev-zubayer
git merge dev
git push origin dev-zubayer
```

---

# Delete a Local Branch

```bash
git branch -d branch-name
```

---

# Delete a Remote Branch

```bash
git push origin --delete branch-name
```

---

# Check Remote Repository

```bash
git remote -v
```

---

# Fetch Latest Branches

```bash
git fetch --all
```

---

# View All Branches

```bash
git branch -a
```