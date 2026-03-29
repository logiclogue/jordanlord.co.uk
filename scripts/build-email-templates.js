import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import pug from "pug";

const rootDir = process.cwd();
const templatesDir = path.join(rootDir, "templates", "emails");
const outputDir = path.join(rootDir, "build", "emails");
const config = JSON.parse(readFileSync(path.join(rootDir, "config.json"), "utf8"));
const nowYear = new Date().getFullYear();

const theme = {
    background: "#1B1D1E",
    panel: "#232526",
    border: "#293739",
    foreground: "#F8F8F2",
    muted: "#808080",
    heading: "#EF5939",
    accent: "#F92672",
    fontStack: "'Droid Sans Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
};

const footerHtml = [
    `<p style="margin:0 0 8px 0;">${config.siteMetadata.sitedescription}</p>`,
    '<p style="margin:0;">Read <a href="{{ MessageURL }}" style="color:#F92672; text-decoration:none;">this email online</a> or <a href="{{ UnsubscribeURL }}" style="color:#F92672; text-decoration:none;">manage your subscription</a>.</p>'
].join("");

const templates = [
    {
        file: "general.pug",
        output: "general.html",
        locals: {
            subject: "{{ .Campaign.Subject }}",
            eyebrow: '{{ Date "02 Jan 2006" }}',
            title: "{{ .Campaign.Subject }}",
            contentPlaceholder: '{{ template "content" . }}',
            footerHtml,
            trackingHtml: "{{ TrackView }}"
        }
    },
    {
        file: "opt-in.pug",
        output: "opt-in.html",
        locals: {
            subject: `Confirm your subscription to ${config.siteMetadata.sitename}`,
            eyebrow: "opt-in",
            title: "Confirm your subscription",
            previewText: "Confirm your email subscription.",
            ctaLabel: "Confirm subscription",
            ctaUrl: "{{ OptinURL }}",
            secondaryText: "If you did not request this, you can safely ignore this message.",
            footerHtml: `<p style="margin:0;">Copyright &#169; ${nowYear} ${config.siteMetadata.sitename}</p>`
        }
    },
    {
        file: "welcome.pug",
        output: "welcome.html",
        locals: {
            subject: `Welcome to ${config.siteMetadata.sitename}`,
            eyebrow: "welcome",
            title: "Welcome",
            intro: "You are now subscribed to occasional updates from the site.",
            previewText: "Welcome to the Jordan Lord mailing list.",
            ctaLabel: "Browse projects",
            ctaUrl: `${config.siteMetadata.siteurl}/projects`,
            secondaryText: "You can unsubscribe any time from the footer of any e-mail.",
            footerHtml
        }
    }
];

function renderTemplate(file, locals) {
    return pug.renderFile(path.join(templatesDir, file), {
        ...config.siteMetadata,
        ...locals,
        theme,
        year: nowYear
    });
}

function buildListmonkParts(file, locals) {
    const slot = "<!-- LISTMONK_CONTENT_SLOT -->";
    const shell = renderTemplate("listmonk-slot.pug", {
        ...locals,
        listmonkSlot: slot
    });
    const [header, footer] = shell.split(slot);

    if (!header || footer === undefined) {
        throw new Error(`Could not split listmonk shell for ${file}`);
    }

    const full = renderTemplate(file, locals);
    const content = full.replace(header, "").replace(footer, "").trim();

    return { header, footer, content };
}

function renderListmonkContent(file, locals) {
    return renderTemplate(file, locals).trim();
}

mkdirSync(outputDir, { recursive: true });

for (const template of templates) {
    const html = renderTemplate(template.file, template.locals);
    writeFileSync(path.join(outputDir, template.output), html);
}

const listmonkBase = buildListmonkParts("listmonk-slot.pug", {
    subject: `${config.siteMetadata.sitename} mailing list`,
    eyebrow: "mailing list",
    title: "A short note from the mailing list",
    footerHtml: `<p style="margin:0;">Copyright &#169; ${nowYear} ${config.siteMetadata.sitename}</p>`
});

const listmonkSubscriberOptIn = renderListmonkContent("subscriber-optin-content.pug", {});
const listmonkSubscriberOptInCampaign = renderListmonkContent("subscriber-optin-campaign.pug", {});

writeFileSync(
    path.join(outputDir, "listmonk-base.html"),
    `{{ define "header" }}\n${listmonkBase.header}\n{{ end }}\n\n{{ define "footer" }}\n${listmonkBase.footer}\n{{ end }}\n`
);

writeFileSync(
    path.join(outputDir, "listmonk-subscriber-optin.html"),
    `{{ define "subscriber-optin" }}\n{{ template "header" . }}\n${listmonkSubscriberOptIn}\n{{ template "footer" }}\n{{ end }}\n`
);

writeFileSync(
    path.join(outputDir, "listmonk-subscriber-optin-campaign.html"),
    `{{ define "optin-campaign" }}\n{{ template "header" . }}\n${listmonkSubscriberOptInCampaign}\n{{ template "footer" }}\n{{ end }}\n`
);

console.log(`Built ${templates.length + 3} email templates in ${outputDir}`);
