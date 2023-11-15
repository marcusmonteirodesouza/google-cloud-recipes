export:
	poetry export -f requirements.txt --output requirements.txt

format:
	poetry run black .

run:
	poetry run functions-framework --port=8080 --target=process_invoice_emails --signature-type=cloudevent