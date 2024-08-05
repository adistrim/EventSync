Register a new user

```json
URL: http://localhost:8080/register
Method: POST
Body: {
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

Login

```json
URL: http://localhost:8080/login
Method: POST
Body: {
	"email": "john@example.com",
	"password": "password123"
}

Response: {
    "token": "jwt_token"
}
```
