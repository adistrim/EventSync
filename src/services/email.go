package services

import (
	"os"

	"github.com/go-gomail/gomail"
)

func SendEmail(to, subject, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("EMAIL_FROM"))
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	d := gomail.NewDialer(
		os.Getenv("SMTP_HOST"),
		465,
		os.Getenv("EMAIL_FROM"),
		os.Getenv("EMAIL_PASS"),
	)

	d.SSL = true

	return d.DialAndSend(m)
}
