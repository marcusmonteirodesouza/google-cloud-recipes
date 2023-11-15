import functions_framework
from .process_invoice_emails_cloud_function import main


@functions_framework.cloud_event
def process_invoice_emails(cloud_event):
    main()
