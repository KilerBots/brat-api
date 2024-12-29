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
const { link } = req.query

if (!link) {
return res.status(400).json({ error: "parameter link is required" })
}

let stats
try {
const result = await brat(link)
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

async function brat(query) {
const code= "const { chromium } = require('playwright');\n\nasync function ssweb(q) {\nconst browser = await chromium.launch({ headless: true });\nconst page = await browser.newPage();\n\nawait page.goto(\"https://www.bratgenerator.com\");\nconst consentButtonSelector = \"#onetrust-accept-btn-handler\";\nif (await page.$(consentButtonSelector)) {\nawait page.click(consentButtonSelector);\nawait page.waitForTimeout(500);\n}\nawait page.click(\"#toggleButtonWhite\");\nawait page.fill(\"#textInput\", q);\nawait page.locator(\"#textOverlay\").screenshot({ path: 'brat.png' });\nconsole.log('success generate brat.png');\n\nawait browser.close();\n}\nssweb(`" + query + "`).then(a => console.log(a));"
const result = await run("javascript", code)
return "https://try.playwright.tech" + result.result.files[0].publicURL
}

async function ssweb(query) {
const code = "from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    browser = p.chromium.launch()\n    page = browser.new_page()\n    page.goto(" + query +")\n    page.screenshot(path=\"example.png\")\n    browser.close()\n"
const result = await run("python", code)
return "https://try.playwright.tech" + result.result.files[0].publicURL
}
