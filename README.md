# Spring Boot + React Starter

This is a starter project with **Spring Boot** backend and **React (Vite)** frontend, organized in a **multi-module Maven project**.  
The project is licensed under the **MIT License** .

---

## Project Structure
```
cnpmproject/
├─ backend/ # Spring Boot backend
│ ├─ src/main/java/com/ourproject/
│ ├─ src/main/resources/
│ └─ pom.xml
├─ frontend/ # React frontend
│ ├─ src/
│ └─ package.json
├─ pom.xml # root Maven parent
└─ README.md
```
---

## Prerequisites

- Java 23+ (OpenJDK)
- Maven
- Node.js & npm
- IntelliJ IDEA or other IDE

---

## Running Backend

1. Go to backend folder:

```
cd backend
```
2. Build and run the backend:
```
mvn clean install
mvn spring-boot:run
```
The backend runs on: http://localhost:8080/

Test endpoint: http://localhost:8080/api/hello
## Running Frontend
1. Go to frontend folder:
```
cd frontend
```
2. Install dependencies:
```
npm install
```
3. Run the frontend:
```
npm run dev
```
The frontend runs on: http://localhost:5173/

To connect frontend to backend, use API calls to http://localhost:8080/api/...

## Git Ignore
Recommended entries for .gitignore:
```
# Backend
backend/target/

# Frontend
frontend/node_modules/

# IntelliJ
.idea/
```
## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).