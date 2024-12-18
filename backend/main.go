package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"unicode"

	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

// defines the structure of a contact
type Contact struct {
	FirstName   string `json:"FirstName"`
	LastName    string `json:"LastName"`
	PhoneNumber string `json:"PhoneNumber"`
	Email       string `json;"Email"`
}

// slice of contacts to be handed to the client side
var contacts []Contact

// parseGoogleDrive searches the "Communication" folder within the google drive
// and finds the most recent spreadsheets containing the word "Census", implying that
// this is in fact the most recent census we need to pull data from
func parseGoogleDrive() {

	// get the application credentials for the service account in the google drive
	serviceAccKey := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")

	ctx := context.Background()

	// hook up to the communications folder
	driveService, err := drive.NewService(ctx, option.WithCredentialsFile(serviceAccKey))
	if err != nil {
		log.Fatal("couldn't create google drive client")
	}

	// narrow down our search and list only spreadsheets with the word "Census" and order by recency of creation
	r, err := driveService.Files.List().Q("mimeType = 'application/vnd.google-apps.spreadsheet' and name contains 'Census'").OrderBy("createdTime desc").Do()
	if err != nil {
		log.Fatal("error retrieving files")
	}

	// for debugging
	for _, file := range r.Files {
		fmt.Printf("Found file: %s (%s)\n", file.Name, file.Id)

	}
	//----------------------------------------------------------

	// this must be the most recent census
	mostRecentCensusId := r.Files[0].Id
	fmt.Printf("most recent: %v\n", mostRecentCensusId)

	gatherContacts(mostRecentCensusId, ctx, serviceAccKey)

}

// gatherContacts parses the most recent census and gathers first names, last names, emails, and phone numbers.
// it then returns a slice of contacts to be sent to the client
func gatherContacts(censusId string, ctx context.Context, serviceAccKey string) {

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
			FirstName:   strings.TrimSpace(row[0].(string)),
			LastName:    strings.TrimSpace(row[1].(string)),
			PhoneNumber: formatPhoneNumber(row[4].(string)),
			Email:       strings.TrimSpace(row[5].(string)),
		})
	}

	//debugging
	fmt.Printf("contacts: %v\n", contacts)

}

// for a .vcf file phone numbers must be formatted as (xxx) xxx-xxxx
// which is how it will be returned
func formatPhoneNumber(phoneNumber string) string {
	var cleanedNumber string

	for _, char := range phoneNumber {
		if unicode.IsNumber(char) {
			cleanedNumber += string(char)
		}
	}

	formattedNumber := fmt.Sprintf("(%s) %s-%s", cleanedNumber[0:3], cleanedNumber[3:6], cleanedNumber[6:10])

	return formattedNumber
}

func validateAccess(w http.ResponseWriter, r *http.Request) bool {
	referer := r.Referer()
	if referer == "" || !strings.Contains(referer, "canvas") {
		http.Error(w, "Unauthorized access", http.StatusForbidden)
		return false
	}
	return true
}

func getContacts(w http.ResponseWriter, r *http.Request) {

	// if !validateAccess(w, r) {
	//     return
	// }

	w.Header().Set("Content-Type", "application/json")

	err := json.NewEncoder(w).Encode(contacts)
	if err != nil {
		http.Error(w, "couldn't encode contacts", http.StatusInternalServerError)
		log.Printf("error encoding and sending contacts to client: %v", err)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Couldn't load .env")
	}

	parseGoogleDrive()
	fmt.Printf("Contacts after parseGoogleDrive call: %v", contacts)

	mux := http.NewServeMux()

	mux.HandleFunc("/contacts", getContacts)

	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000"}),
		handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
		handlers.AllowCredentials(),
	)(mux)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler))

}
