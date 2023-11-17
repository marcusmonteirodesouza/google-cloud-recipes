# Google Cloud Demo - Invoice Management System

## Deployment

1. Make sure to own a [Domain Name](https://en.wikipedia.org/wiki/Domain_name) or have access to it's DNS configuration. You will need to create an [A record](https://support.google.com/a/answer/2576578?hl=en#zippy=%2Cconfigure-a-records-now) to set up HTTPS at the end of the deployment.
1. Have an [SSL certificate](https://www.cloudflare.com/en-ca/learning/ssl/what-is-an-ssl-certificate/) or generate a [self-signed one](https://www.ibm.com/docs/en/api-connect/2018.x?topic=overview-generating-self-signed-certificate-using-openssl) (for testing purposes).
1. [Set up POP](https://support.google.com/mail/answer/7104828?hl=en&visit_id=638357869590530116-627231305&rd=1) for the Gmail account you want to receive invoices at. It will correspond to the `process_invoice_emails_gmail_address` `terraform` variable.
1. [Set up an App password](https://support.google.com/mail/answer/185833?hl=en) for the Gmail account you want to receive invoices at. 
1. [Install terraform](https://developer.hashicorp.com/terraform/downloads).
1. [Install the gcloud CLI](https://cloud.google.com/sdk/docs/install).
1. [Create a Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project).
1. Create the following [Google groups](https://cloud.google.com/iam/docs/groups-in-cloud-console) to fill out the values of the following variables:
   - `vendors_management_app_users_group`
1. Run [`gcloud auth login`](https://cloud.google.com/sdk/gcloud/reference/auth/login).
1. Run [`gcloud config set project <your Google Cloud Project ID>`](https://cloud.google.com/sdk/gcloud/reference/config/set).
1. Run [`gcloud auth application-default login`](https://cloud.google.com/sdk/gcloud/reference/auth/application-default/login).
1. `cd` into the [`terraform` folder](./infra/deployment/terraform/)
1. Run `cp terraform.tfvars.template terraform.tfvars` and fill out the variables with your own values.
1. Comment out the contents of the `backend.tf` file.
1. Run `terraform init`.
1. Run `terraform apply -target=module.enable_apis`.
1. Create the OAuth2 Client ID to be able to fill out the `oauth2_client_id` and `oauth2_client_secret` variables:
   1. Go to your Google Cloud console and select your project.
   1. Go to the `APIs & Services` and select `Credentials` in the menu on the left.
   1. Click the `Create Credentials` button and select `OAuth client ID`.
   1. Click the `Configure Consent Screen` button. 
   1. Select the [`Internal`](https://support.google.com/cloud/answer/10311615#user-type&zippy=%2Cinternal) user type.
   1. Add your `App name` (e.g. Invoice Management System), the `User support email`, and the `Developer contact information` and then click `Save and continue`.
   1. If you want, you can check the See the [Setting up your OAuth consent screen documentation
](https://support.google.com/cloud/answer/10311615?hl=en) for more details on configuring the Consent Screen.
   1. Go to the `APIs & Services` once again and select `Credentials` in the menu on the left.
   1. Click the `Create Credentials` button and select `OAuth client ID`.
   1. When prompted for the application type select `Web application`.
   1. Pick a name for your credentials (e.g. Invoice Management System Client), add the `vendors_management_app_domain` value as an [`Authorized JavaScript origin`](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#creatingcred) and click create.
   1. When the credentials are created click on them and proceed to add an `Authorized URI` in the format of `https://iap.googleapis.com/v1/oauth/clientIds/${iap_client_id}:handleRedirect`. Where `${iap_client_id}` is the Client ID of your credentials (can be seen on the right).
1. Run `terraform apply -target=module.kms`.
1. Run `terraform apply -target=module.iam`.
1. Run `terraform apply -target=module.network`.
1. Run `terraform apply`.
1. Use the `load_balancer_ip_address` output value to [Configure DNS records on your domain](https://cloud.google.com/run/docs/multiple-regions#dns-config).

### (Optional) Use GCS backend for the terraform state.

1. Uncomment the contents of the `backend.tf` and set the `bucket` attribute to the value of the `terraform_tfstate_bucket` output.
1. Run `terraform init` and type `yes`.
