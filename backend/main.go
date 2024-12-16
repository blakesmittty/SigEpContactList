package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

type Contact struct {
	FirstName   string
	LastName    string
	PhoneNumber string
	Email       string
}

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

	mostRecentCensusId := r.Files[0].Id
	fmt.Printf("most recent: %v\n", mostRecentCensusId)

	initGoogleSheetsClient(mostRecentCensusId, ctx, serviceAccKey)

}

func initGoogleSheetsClient(censusId string, ctx context.Context, serviceAccKey string) {
	var contacts []Contact

	sheetsService, err := sheets.NewService(ctx, option.WithCredentialsFile(serviceAccKey))
	if err != nil {
		log.Fatal("couldn't create google sheets client")
	}
	resp, err := sheetsService.Spreadsheets.Values.Get(censusId, "Form Responses 1!B2:G250").Do()
	if err != nil {
		log.Fatalf("couldnt get census values: %v", err)
	}

	if len(resp.Values) == 0 {
		fmt.Println("no data found")
	}

	for _, row := range resp.Values {
		if len(row) == 0 {
			fmt.Println("found empty row")
			break
		}

		contacts = append(contacts, Contact{
			FirstName:   row[0].(string),
			LastName:    row[1].(string),
			PhoneNumber: row[4].(string),
			Email:       row[5].(string),
		})
	}

	fmt.Printf("contacts: %v\n", contacts)

}

// func getContacts(w http.ResponseWriter, r *http.Request) {

// }

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Couldn't load .env")
	}

	initGoogleDriveClient()

}
