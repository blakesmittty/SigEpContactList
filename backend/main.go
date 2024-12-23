package main

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
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
	Email       string `json:"Email"`
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
	driveService, err := drive.NewService(ctx, option.WithCredentialsJSON([]byte(serviceAccKey)))
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

	sheetsService, err := sheets.NewService(ctx, option.WithCredentialsJSON([]byte(serviceAccKey)))
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

// getContacts is an API endpoint that sends the contacts slice to the client
func getContacts(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	err := json.NewEncoder(w).Encode(contacts)
	if err != nil {
		http.Error(w, "couldn't encode contacts", http.StatusInternalServerError)
		log.Printf("error encoding and sending contacts to client: %v", err)
	}
}

// downloadAll sends a .zip archive containing a .vcf file containing
// all contacts to the client
func downloadAll(w http.ResponseWriter, r *http.Request) {

	// create a buffer to store the zip data
	var zipBuffer bytes.Buffer

	// create a new zip writer
	zipWriter := zip.NewWriter(&zipBuffer)

	// add the VCF file to the zip archive
	vcfFile, err := zipWriter.Create("all-contacts.vcf")
	if err != nil {
		http.Error(w, "Error creating zip file", http.StatusInternalServerError)
		log.Printf("Error creating zip entry: %v", err)
		return
	}

	// write VCF data to the zip file
	for _, contact := range contacts {
		_, err := vcfFile.Write([]byte(contact.ToVCF() + "\n"))
		if err != nil {
			http.Error(w, "Error writing VCF data to zip", http.StatusInternalServerError)
			log.Printf("Error writing VCF data to zip: %v", err)
			return
		}
	}

	// close the zip writer
	err = zipWriter.Close()
	if err != nil {
		http.Error(w, "Error finalizing zip file", http.StatusInternalServerError)
		log.Printf("Error closing zip writer: %v", err)
		return
	}

	// set headers for the zip file download
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="contacts.zip"`)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", zipBuffer.Len()))
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("X-Suggested-Filename", "contacts.zip")

	// write the zip data to the response
	_, err = w.Write(zipBuffer.Bytes())
	if err != nil {
		http.Error(w, "Error writing zip file to response", http.StatusInternalServerError)
		log.Printf("Error writing zip data to response: %v", err)
	}
}

// downloadSelected sends a .zip archive containing a .vcf of a
// subset of contacts, in contacts, determined by the user
// through a URI component
func downloadSelected(w http.ResponseWriter, r *http.Request) {
	emails := r.URL.Query().Get("emails")
	if emails == "" {
		http.Error(w, "No contact IDs provided", http.StatusBadRequest)
		log.Println("User supplied no contacts")
		return
	}

	contactEmails := strings.Split(emails, ",")

	var selectedContacts []Contact

	// loop over emails sent by the client and contacts to find matches to add to .vcf file
	for _, email := range contactEmails {
		for _, contact := range contacts {
			if email == contact.Email {
				selectedContacts = append(selectedContacts, contact)
				break
			}
		}
	}

	if len(selectedContacts) == 0 {
		http.Error(w, "No matching contacts found", http.StatusNotFound)
		return
	}

	var zipBuffer bytes.Buffer

	// initialize writer for the zip archive and make a vcf file
	zipWriter := zip.NewWriter(&zipBuffer)
	vcfFile, err := zipWriter.Create("selected-contacts.vcf")
	if err != nil {
		http.Error(w, "Error creating zip file", http.StatusInternalServerError)
		log.Printf("Error creating zip entry: %v", err)
		return
	}

	// write each contact to the .vcf file
	for _, contact := range selectedContacts {
		_, err := vcfFile.Write([]byte(contact.ToVCF() + "\r\n"))
		if err != nil {
			http.Error(w, "Error writing VCF data", http.StatusInternalServerError)
			log.Printf("Error writing VCF data: %v", err)
			return
		}
	}

	// finalize the ZIP archive
	err = zipWriter.Close()
	if err != nil {
		http.Error(w, "Error finalizing zip file", http.StatusInternalServerError)
		log.Printf("Error closing zip writer: %v", err)
		return
	}

	// set headers for the zip file download
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="selected-contacts.zip"`)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", zipBuffer.Len()))
	w.Header().Set("Cache-Control", "no-cache")

	// write the ZIP file to the response
	_, err = w.Write(zipBuffer.Bytes())
	if err != nil {
		http.Error(w, "Error writing zip to response", http.StatusInternalServerError)
		log.Printf("Error writing zip data to response: %v", err)
	}

}

// ToVCF formats a contact into a vcard entry
func (c Contact) ToVCF() string {
	return fmt.Sprintf(
		"BEGIN:VCARD\r\n"+
			"VERSION:3.0\r\n"+
			"FN:%s %s\r\n"+
			"N:%s;%s;;;\r\n"+
			"TEL;TYPE=CELL:%s\r\n"+
			"EMAIL;TYPE=WORK:%s\r\n"+
			"REV:%s\r\n"+
			"END:VCARD\r\n",
		c.FirstName, c.LastName, c.LastName, c.FirstName, c.PhoneNumber, c.Email, time.Now().Format("20060102T150405Z"),
	)
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
	mux.HandleFunc("/download-all", downloadAll)
	mux.HandleFunc("/download-selected", downloadSelected)

	corsHandler := handlers.CORS(
		//handlers.AllowedOrigins([]string{"http://localhost:3000", "https://f4d6-67-159-204-221.ngrok-free.app", "http://192.198.1.150:3000", "http://192.168.1.214", "http://192.168.1.*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
		handlers.AllowedOrigins([]string{"*"}),
		//handlers.AllowCredentials(),
	)(mux)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler))

}
