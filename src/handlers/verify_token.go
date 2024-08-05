package handlers

import (
	"net/http"
	"strings"

	"github.com/adistrim/gohttp/utils"
)

func VerifyTokenHandler(w http.ResponseWriter, r *http.Request) {
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, "Authorization header is required", http.StatusUnauthorized)
        return
    }

    bearerToken := strings.Split(authHeader, " ")
    if len(bearerToken) != 2 {
        http.Error(w, "Invalid token format", http.StatusUnauthorized)
        return
    }

    token := bearerToken[1]

    claims, err := utils.VerifyToken(token)
    if err != nil {
        http.Error(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Token is valid for user: " + claims.Email))
}
