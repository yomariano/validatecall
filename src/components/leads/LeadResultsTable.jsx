import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Tag, Loader2, Wand2, X, Phone, Users, Search, CheckSquare, Square, Mail, Star, PhoneCall, Pencil, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/loading';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function LeadResultsTable({ leads, setFilter, filter, categoryFilter, setCategoryFilter, categories, handleClassifyAll, isClassifying, allLeads, classifyProgress, locationFilter, searchName, searchPhone, searchEmail, searchCity, searchIndustry, searchRatingMin, searchStatus, setLocationFilter, setSearchName, setSearchPhone, setSearchEmail, setSearchCity, setSearchIndustry, setSearchRatingMin, setSearchStatus, selectedLeads, startCampaignWithSelected, toggleSelectAll, toggleSelectLead, getStatusBadge, openPanel }) {
  return (<Card className="border-white/20 bg-white/20 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="flex flex-col gap-4 pb-4 sm:pb-6 px-4 sm:px-6 bg-white/10 border-b border-border/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold">Leads <span className="text-primary/50 text-xs sm:text-sm font-black ml-1">({leads.length})</span></CardTitle>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status filter tabs - scrollable on mobile */}
              <div className="flex items-center gap-1.5 p-1 bg-white/20 rounded-xl border border-white/20 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'new', label: 'New' },
                  { id: 'contacted', label: 'Called' },
                  { id: 'interested', label: 'Hot' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={cn(
                      "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0",
                      filter === tab.id
                        ? "bg-white shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-9 h-10 w-full sm:w-36 text-xs bg-white/20 border-white/20 rounded-xl"
                  >
                    <option value="all">All Industries</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClassifyAll}
                  disabled={isClassifying || allLeads.length === 0}
                  className="h-10 gap-2 text-xs border-primary/20 hover:bg-primary/5 text-primary rounded-xl w-full sm:w-auto"
                  title="Re-classify all leads into standardized industries using AI"
                >
                  {isClassifying ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="truncate">{classifyProgress || 'Classifying...'}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3" />
                      Classify
                    </>
                  )}
                </Button>
              </div>

              {(filter !== 'all' || categoryFilter !== 'all' || locationFilter !== 'all' || searchName || searchPhone || searchEmail || searchCity || searchIndustry || searchRatingMin || searchStatus) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilter('all');
                    setCategoryFilter('all');
                    setLocationFilter('all');
                    setSearchName('');
                    setSearchPhone('');
                    setSearchEmail('');
                    setSearchCity('');
                    setSearchIndustry('');
                    setSearchRatingMin('');
                    setSearchStatus('');
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}

              {selectedLeads.length > 0 && (
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={startCampaignWithSelected}
                  className="h-10 px-6 rounded-xl font-bold shadow-lg shadow-primary/15 animate-in slide-in-from-right-4"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call {selectedLeads.length} Selected
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {leads.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No leads yet"
                  description="Scrape Google Maps or import a file to get started"
                  icon={Users}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="w-14 text-center">
                        <button
                          onClick={toggleSelectAll}
                          className="w-6 h-6 rounded-md border-2 border-primary/20 flex items-center justify-center transition-all hover:bg-primary/5 active:scale-90"
                        >
                          {selectedLeads.length === leads.length ? (
                            <div className="w-3 h-3 bg-primary rounded-[2px]" />
                          ) : selectedLeads.length > 0 ? (
                            <div className="w-3 h-[2px] bg-primary/50 rounded-full" />
                          ) : null}
                        </button>
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Business Details</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">City</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Industry</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rating</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right pr-6">Management</TableHead>
                    </TableRow>
                    {/* Column Search Row */}
                    <TableRow className="border-border/50 hover:bg-transparent bg-muted/10">
                      <TableHead className="w-14 py-2">
                        <Search className="h-3.5 w-3.5 text-muted-foreground mx-auto" />
                      </TableHead>
                      <TableHead className="py-2">
                        <Input
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          placeholder="Search name..."
                          className="h-7 text-xs bg-white/50 border-white/30 rounded-lg"
                        />
                      </TableHead>
                      <TableHead className="py-2">
                        <Input
                          value={searchPhone}
                          onChange={(e) => setSearchPhone(e.target.value)}
                          placeholder="Search phone..."
                          className="h-7 text-xs bg-white/50 border-white/30 rounded-lg"
                        />
                      </TableHead>
                      <TableHead className="py-2">
                        <Input
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          placeholder="Search email..."
                          className="h-7 text-xs bg-white/50 border-white/30 rounded-lg"
                        />
                      </TableHead>
                      <TableHead className="py-2">
                        <Input
                          value={searchCity}
                          onChange={(e) => setSearchCity(e.target.value)}
                          placeholder="Search city..."
                          className="h-7 text-xs bg-white/50 border-white/30 rounded-lg"
                        />
                      </TableHead>
                      <TableHead className="py-2">
                        <Input
                          value={searchIndustry}
                          onChange={(e) => setSearchIndustry(e.target.value)}
                          placeholder="Search industry..."
                          className="h-7 text-xs bg-white/50 border-white/30 rounded-lg"
                        />
                      </TableHead>
                      <TableHead className="py-2">
                        <Input
                          value={searchRatingMin}
                          onChange={(e) => setSearchRatingMin(e.target.value)}
                          placeholder="Min ★"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          className="h-7 text-xs bg-white/50 border-white/30 rounded-lg w-16"
                        />
                      </TableHead>
                      <TableHead className="py-2">
                        <Select
                          value={searchStatus}
                          onChange={(e) => setSearchStatus(e.target.value)}
                          className="h-7 text-xs bg-white/50 border-white/30 rounded-lg"
                        >
                          <option value="">All</option>
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="interested">Interested</option>
                          <option value="rejected">Rejected</option>
                        </Select>
                      </TableHead>
                      <TableHead className="py-2 pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead, index) => (
                      <TableRow key={`${lead.id}-${index}`} className={cn(
                        selectedLeads.includes(lead.id) && "bg-primary/5"
                      )}>
                        <TableCell>
                          <button onClick={() => toggleSelectLead(lead.id)} className="p-1">
                            {selectedLeads.includes(lead.id) ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            {/^[hH][tT][tT][pP][sS]?:\/\//.test(lead.source_url || lead.sourceUrl || '') && <a
                              href={lead.source_url || lead.sourceUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-primary underline" onClick={event => event.stopPropagation()}
                            >View source</a>}
                            {lead.address && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {lead.address}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                              title={lead.email}
                            >
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[140px]">{lead.email}</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(lead.city || lead.search_location) ? (
                            <span className="text-sm">{lead.city || lead.search_location}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.category && (
                            <Badge variant="secondary">{lead.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span>{lead.rating}</span>
                              {lead.review_count && (
                                <span className="text-xs text-muted-foreground">
                                  ({lead.review_count})
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPanel('call', lead)}
                              className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10 rounded-lg transition-transform hover:scale-110"
                              title="Call lead"
                            >
                              <PhoneCall className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPanel('email', lead)}
                              className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-transform hover:scale-110"
                              title="Send cold email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPanel('edit', lead)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-transform hover:scale-110"
                              title="Edit lead"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {(lead.google_maps_url || lead.latitude) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPanel('location', lead)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-transform hover:scale-110"
                                title="View location"
                              >
                                <MapPin className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>);
}
