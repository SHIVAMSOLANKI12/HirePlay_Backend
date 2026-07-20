import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

export const renderTemplate = (eventName, variables) => {
  const templateDir = path.join(process.cwd(), 'src', 'modules', 'notification', 'email', 'templates', eventName);
  
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory for event '${eventName}' does not exist.`);
  }

  const subjectPath = path.join(templateDir, 'subject.hbs');
  const htmlPath = path.join(templateDir, 'html.hbs');
  const textPath = path.join(templateDir, 'text.hbs');

  const subjectTemplate = Handlebars.compile(fs.readFileSync(subjectPath, 'utf8'));
  const htmlTemplate = Handlebars.compile(fs.readFileSync(htmlPath, 'utf8'));
  const textTemplate = Handlebars.compile(fs.readFileSync(textPath, 'utf8'));

  const innerHtml = htmlTemplate(variables);
  
  // Try to load base layout if we want to wrap the html
  let finalHtml = innerHtml;
  try {
    const layoutPath = path.join(process.cwd(), 'src', 'modules', 'notification', 'email', 'templates', 'layout.hbs');
    if (fs.existsSync(layoutPath)) {
      const layoutTemplate = Handlebars.compile(fs.readFileSync(layoutPath, 'utf8'));
      finalHtml = layoutTemplate({
        ...variables,
        BodyContent: innerHtml,
        Year: new Date().getFullYear(),
        PrimaryColor: variables.branding?.primaryColor || '#007bff',
        LogoUrl: variables.branding?.logoUrl || null,
        CompanyName: variables.branding?.companyName || variables['Company Name'] || 'HirePlay',
        SupportEmail: variables.branding?.supportEmail || 'support@hireplay.com'
      });
    }
  } catch (e) {
    console.error("Error applying layout:", e);
  }

  return {
    subject: subjectTemplate(variables),
    html: finalHtml,
    text: textTemplate(variables)
  };
};
