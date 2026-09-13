import { useEffect, useState } from 'react';
import { vapiApi as voiceApi } from '../services/api';
import VoiceTestModal from '../components/VoiceTestModal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input, Textarea, FormGroup, Select } from '@/components/ui/input';
const empty = { name:'', instructions:'', first_message:'Hi, this is an AI assistant calling for a short research conversation. Is now a good time?', realtime_provider:'openai', model:'gpt-realtime-2.1', voice:'marin', language:'en', voicemail_action:'hang_up', end_call_enabled:true };
export default function Agents() {
  const [agents,setAgents]=useState([]), [form,setForm]=useState(null), [editing,setEditing]=useState(null);
  const [error,setError]=useState(''), [busy,setBusy]=useState(false), [testing,setTesting]=useState(null);
  const load=async()=>{ const result=await voiceApi.getAssistants(); setAgents(Array.isArray(result)?result:result.assistants||[]); };
  useEffect(()=>{load().catch(error=>setError(error.message));},[]);
  const save=async(event)=>{
    event.preventDefault(); setError(''); setBusy(true);
    try {if(editing) await voiceApi.updateAssistant(editing,form); else await voiceApi.createAssistant(form);
      await load(); setForm(null); setEditing(null);
    } catch(error){setError(error.message);} finally{setBusy(false);}
  };
  const field=(key,value)=>setForm(previous=>({...previous,[key]:value}));
  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Voice Agents</h1><p className="text-muted-foreground">Create AssistantFleet agents for your campaigns.</p></div>
      <Button onClick={()=>{setEditing(null);setForm({...empty});}}>Create Voice Agent</Button></div>
    <p className="text-sm text-muted-foreground">Only agents created in this ValidateCall workspace appear here. Telephone calls require a dedicated Telnyx number for each destination country.</p>
    {error&&<p role="alert" className="text-red-600">{error}</p>}
    {form&&<Card><CardHeader><CardTitle>{editing?'Edit Voice Agent':'Create Voice Agent'}</CardTitle></CardHeader><CardContent>
      <form className="space-y-4" onSubmit={save}>
        <FormGroup label="Agent Name"><Input required maxLength={120} value={form.name} onChange={event=>field('name',event.target.value)} placeholder="e.g., ValidateCall Research Assistant" /></FormGroup>
        <FormGroup label="Instructions"><Textarea required value={form.instructions} onChange={event=>field('instructions',event.target.value)} placeholder="Explain the agent’s purpose, questions to ask, and when to end the conversation." rows={8}/></FormGroup>
        <FormGroup label="First Message"><Textarea value={form.first_message} onChange={event=>field('first_message',event.target.value)} /></FormGroup>
        <FormGroup label="Voice"><Select value={form.voice} onChange={event=>field('voice',event.target.value)}><option value="marin">Marin</option><option value="cedar">Cedar</option></Select></FormGroup>
        <FormGroup label="Language"><Select value={form.language} onChange={event=>field('language',event.target.value)}><option value="en">English</option><option value="es">Spanish</option><option value="pt">Portuguese</option><option value="fr">French</option><option value="de">German</option></Select></FormGroup>
        <FormGroup label="Voicemail"><Select value={form.voicemail_action} onChange={event=>field('voicemail_action',event.target.value)}><option value="hang_up">End the call</option><option value="continue">Continue the conversation</option></Select></FormGroup>
        <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy?'Saving…':'Save Voice Agent'}</Button><Button type="button" variant="outline" onClick={()=>setForm(null)}>Cancel</Button></div>
      </form>
    </CardContent></Card>}
    {!agents.length&&!form&&<Card><CardContent className="py-12 text-center">No voice agents yet. Create an agent, then select it in a campaign.</CardContent></Card>}
    <div className="grid gap-4 md:grid-cols-2">{agents.map(agent=><Card key={agent.id}><CardHeader><CardTitle>{agent.name}</CardTitle></CardHeader><CardContent className="space-y-3">
      <p className="text-sm">{agent.first_message}</p><p className="text-sm text-muted-foreground">AssistantFleet · {agent.voice} · {agent.language}</p>
      <div className="flex gap-2"><Button variant="outline" onClick={()=>{setEditing(agent.id);setForm(Object.fromEntries(Object.keys(empty).map(key=>[key,agent[key]??empty[key]])));}}>Edit</Button>
        <Button variant="outline" onClick={()=>setTesting(agent)}>Test in Browser</Button>
        <Button variant="ghost" onClick={async()=>{if(!window.confirm(`Delete ${agent.name}?`))return;try{await voiceApi.deleteAssistant(agent.id);await load();}catch(error){setError(error.message);}}}>Delete</Button></div>
    </CardContent></Card>)}</div>
    <VoiceTestModal agent={testing} isOpen={!!testing} onClose={()=>setTesting(null)}/>
  </div>;
}
