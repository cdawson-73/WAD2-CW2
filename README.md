# WAD2-CW2
WAD2 Coursework 2 Website Files
Files for my Coursework 2, Web Application Development 2 module.

To run locally, this site requires a number of dependancies which are detailed in the package.json file.

Databases will be created upon the initiation of the application. An environment (dotenv) file will be needed with the following variables:

USER - an email address to send password reset emails.
PASS - the password for the email address.
HOST - the host data for your email provider.
EMAILPORT - the port on which the email should be sent (this data is usually found with the host info from the provider).
SERVICE - the service name of the email provider.
SECRET - a secret to allow the express session to work.
SITEURL - the url of the main site.

This website allows guests to view a home/about page, some useful links, a login page and a sign up page.

The useful links page shows the viewer several links to resources regarding mental health.

Upon registration, users are able to access the rest of the site. This includes viewing articles based on the topics of fitness, nutrition, and a healthy-lifestyle.

The user is also able to create goals based around these topics. These goals can be edited, marked as complete, or deleted. Once marked as complete, the user can no
longer edit or delete them. A tally is also displayed showing how many of each category are set and complete.

Goals are also linked to achievements which are automatically awarded upon the setting and completing of goals.

A password reset function was also implemented. Passwords are often forgotten and this allows the user to generate an email with a unique link to reset their
password.
