package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

// func determineSemester() string {
// 	var semester string

// 	currentTime := time.Now()
// 	month := currentTime.Month()
// 	year := currentTime.Year() - 2000 // stops working in the year 2100 lol

// 	if month >= time.August && month <= time.December {
// 		semester = "AU"
// 	} else {
// 		semester = "SP"
// 	}

// 	semester += strconv.Itoa(year)

// 	fmt.Printf("Sem: %v\n", semester)

// 	return semester
// }

func initGoogleDriveClient() {
	serviceAccKey := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")

	ctx := context.Background()

	driveService, err := drive.NewService(ctx, option.WithCredentialsFile(serviceAccKey))
	if err != nil {
		log.Fatal("couldn't create google drive client")
	}

	r, err := driveService.Files.List().Q("mimeType = 'application/vnd.google-apps.spreadsheet' and name contains 'Census'").OrderBy("createdTime desc").Do()
	if err != nil {
		log.Fatal("error retrieving files")
	}

	for _, file := range r.Files {
		fmt.Printf("Found file: %s (%s)\n", file.Name, file.Id)

	}

}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Couldn't load .env")
	}

	initGoogleDriveClient()

}
