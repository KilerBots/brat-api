const express = require("express")
const os = require("os")
const axios = require("axios")
const { run } = require("shannz-playwright")
const app = express()
const PORT = process.env.PORT || 7860
let totalHits = 0
let hitsPerMinute = 0

app.get("/", (req,res) => {
res.json({
endpoint: ["/generate", "/ssweb"],
stats: {
hitsPerMinute,
totalHits,
},
runtime: {
os: os.type(),
platform: os.platform(),
architecture: os.arch(),
cpuCount: os.cpus().length,
uptime: new Date(process.uptime() * 1000).toTimeString().split(' ')[0],
memoryUsage: `${Math.round((os.totalmem() - os.freemem()) / 1024 / 1024)} MB used of ${Math.round(os.totalmem() / 1024 / 1024)} MB`
}
})
})

app.get("/generate", async (req, res) => {
const { query } = req.query
if (!query) {
return res.status(400).json({ error: "Query parameter is required" })
}
let stats
try {
const result = await brat(query)
const response = await axios.get(result.url, { responseType: 'arraybuffer' })
res.set('Content-Type', 'image/webp')
res.send(response.data)
stats = 200
} catch (error) {
console.error(error)
res.status(500).json({ error: "Failed to generate brat" })
stats = 500
}
if (stats === 200) {
hitsPerMinute++
totalHits++
}
})

app.get("/ssweb", async (req, res) => {
const { link,width,height } = req.query
if (!link) {
return res.status(400).json({ error: "parameter link is required" })
}
let stats
try {
const result = await ssweb(link,width,height)
const response = await axios.get(result.url, { responseType: 'arraybuffer' })
res.set('Content-Type', 'image/webp')
res.send(response.data)
stats = 200
} catch (error) {
console.error(error)
res.status(500).json({ error: "Failed to generate brat" })
stats = 500
}
if (stats === 200) {
hitsPerMinute++
totalHits++
}
})

app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`)
})

setInterval(() => {
hitsPerMinute = 0
}, 60000)

setInterval(async() => {
await ssweb("https://8z6lj9.csb.app")
console.log("Uptime")
}, 60000)
async function brat(query) {
const code= "const { chromium } = require('playwright');\n\nasync function ssweb(q) {\nconst browser = await chromium.launch({ headless: true });\nconst page = await browser.newPage();\n\nawait page.goto(\"https://www.bratgenerator.com\");\nconst consentButtonSelector = \"#onetrust-accept-btn-handler\";\nif (await page.$(consentButtonSelector)) {\nawait page.click(consentButtonSelector);\nawait page.waitForTimeout(500);\n}\nawait page.click(\"#toggleButtonWhite\");\nawait page.fill(\"#textInput\", q);\nawait page.locator(\"#textOverlay\").screenshot({ path: 'brat.png' });\nconsole.log('success generate brat.png');\n\nawait browser.close();\n}\nssweb(`" + query + "`).then(a => console.log(a));"
const result = await run("javascript", code)
const files = result.result.files
const fileData = files[0]
return {
url: "https://try.playwright.tech" + fileData.publicURL,
fileName: fileData.fileName,
extension: fileData.extension,
}
}

async function ssweb(query, width = 1920, height = 1020) {
    const code = `const { chromium } = require('playwright');\n\n(async () => {\nconst browser = await chromium.launch();\nconst page = await browser.newPage({ viewport: { ${width}, ${height} } });\nawait page.goto(\"` + query + `\", { waitUntil: 'networkidle' });\nawait page.waitForTimeout(5000)\nawait page.screenshot({ path: \"Uptime.png\", fullPage: true });\nawait browser.close();\n})();\n`;
    
    const result = await run("javascript", code); // Menjalankan kode melalui API atau runtime tertentu
    const files = result.result.files;
    const fileData = files[0];
    return {
        url: "https://try.playwright.tech" + fileData.publicURL,
        fileName: fileData.fileName,
        extension: fileData.extension,
    };
}
