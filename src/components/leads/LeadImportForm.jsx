import IndustryResearch from './IndustryResearch';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Search, Upload, Copy, Sparkles, MapPin, Users, Loader2, Bot, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormGroup, Input, Select, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LeadImportForm({ setImportTab, importTab, keyword, setKeyword, isScraping, location, setLocation, websiteInput, setWebsiteInput, startingUrls, maxResults, setMaxResults, handleScrape, scrapeStatus, fileInputRef, handleFileUpload, downloadSampleCSV, pasteData, setPasteData, handlePasteImport, isImporting }) {
  return (<Card className="border-white/20 bg-white/40 backdrop-blur-xl shadow-2xl animate-scale-in">
          <CardHeader className="pb-4 border-b border-border/10 px-4 sm:px-6">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1">
              {[
                { id: 'scrape', label: 'Web Research', shortLabel: 'Search', icon: Search },
                { id: 'file', label: 'Upload File', shortLabel: 'Upload', icon: Upload },
                { id: 'paste', label: 'Copy & Paste', shortLabel: 'Paste', icon: Copy }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setImportTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 relative shrink-0",
                    importTab === tab.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 px-4 sm:px-6">
            {/* Scrape Tab */}
            {importTab === 'scrape' && (
              <>
                <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
                  <FormGroup label="Business Type / Keyword" className="space-y-2">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="e.g., restaurants, dentists, plumbers"
                        disabled={isScraping}
                        className="pl-10 h-12 bg-white/50 border-white/20 hover:border-primary/30 focus:border-primary transition-all rounded-xl"
                      />
                    </div>
                  </FormGroup>
                  <FormGroup label="Location" className="space-y-2">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Dublin, Ireland"
                        disabled={isScraping}
                        className="pl-10 h-12 bg-white/50 border-white/20 hover:border-primary/30 focus:border-primary transition-all rounded-xl"
                      />
                    </div>
                  </FormGroup>
                </div>
                <FormGroup label="Starting websites (optional)">
                  <Textarea aria-label="Starting websites" value={websiteInput} onChange={e => setWebsiteInput(e.target.value)} disabled={isScraping} rows={2} placeholder="https://business.example/contact" />
                  <p className="text-xs text-muted-foreground">Add up to three business or directory URLs, one per line. Otherwise AI chooses candidate websites and checks their pages. This is a focused crawl, not a complete web search.</p>
                </FormGroup>
                <div className="grid md:grid-cols-2 gap-4 sm:gap-8 pt-2 sm:pt-4">
                  <FormGroup label="Max Results" className="space-y-2">
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={maxResults}
                        onChange={(e) => setMaxResults(Number(e.target.value))}
                        disabled={isScraping}
                        className="pl-10 h-12 bg-white/50 border-white/20 rounded-xl"
                      >
                        <option value={10}>10 businesses</option>
                        <option value={20}>20 businesses</option>
                      </Select>
                    </div>
                  </FormGroup>
                  <div className="flex items-end pt-2 md:pt-0">
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={handleScrape}
                      disabled={isScraping || !keyword || !location}
                      className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                      {isScraping ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="animate-pulse">{scrapeStatus}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5" />
                          <span>Research Websites</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-70">
                    Up to 6 pages per run • sourced business contacts • results may be fewer than requested
                  </p>
                </div>
                <IndustryResearch keyword={keyword} location={location} startingUrls={startingUrls} />
              </>
            )}

            {/* File Upload Tab */}
            {importTab === 'file' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer space-y-4 block">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload CSV or JSON file</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Or drag and drop your file here
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Need a template?</p>
                      <p className="text-xs text-muted-foreground">
                        Download our sample CSV format
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                    <Download className="h-4 w-4" />
                    Download Sample
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">Required columns:</p>
                  <p><code className="bg-secondary px-1.5 py-0.5 rounded">name</code> and <code className="bg-secondary px-1.5 py-0.5 rounded">phone</code></p>
                  <p className="mt-2">Optional: email, address, city, website, category, rating</p>
                </div>
              </div>
            )}

            {/* Paste Tab */}
            {importTab === 'paste' && (
              <div className="space-y-4">
                <FormGroup label="Paste your data (CSV or JSON format)">
                  <Textarea
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    placeholder={`CSV format:
name,phone,email,address
"Joe's Pizza","+1-555-0123","joe@pizza.com","123 Main St"

OR JSON format:
[
  {"name": "Joe's Pizza", "phone": "+1-555-0123", "email": "joe@pizza.com"}
]`}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </FormGroup>
                <div className="flex gap-3">
                  <Button
                    variant="gradient"
                    onClick={handlePasteImport}
                    disabled={isImporting || !pasteData.trim()}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import Leads
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setPasteData('')}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>);
}
