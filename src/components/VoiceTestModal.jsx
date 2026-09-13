import { useEffect, useRef, useState } from 'react';
import { vapiApi as voiceApi } from '@/services/api';
import { TestRunner } from '@/services/assistantFleetAudio';
import { Button } from '@/components/ui/button';
export default function VoiceTestModal({agent,isOpen,onClose}) {
  const runner=useRef(null), generation=useRef(0);
  const [status,setStatus]=useState('Ready'), [transcript,setTranscript]=useState([]), [busy,setBusy]=useState(false);
  useEffect(()=>()=>{generation.current++;runner.current?.stop();},[]);
  useEffect(()=>{if(!isOpen){generation.current++;runner.current?.stop();runner.current=null;}},[isOpen]);
  if(!isOpen||!agent)return null;
  const stop=()=>{generation.current++;runner.current?.stop();runner.current=null;setBusy(false);};
  const start=async()=>{
    const current=++generation.current;setBusy(true);setStatus('Connecting…');setTranscript([]);
    try {
      const token=await voiceApi.getTestToken(agent.id);
      if(current!==generation.current)return;
      const client=new TestRunner(token.websocket_url,{
        onStatus:message=>{setStatus(message);if(['Disconnected','Stopped'].includes(message))setBusy(false);},
        onTranscript:(role,text)=>setTranscript(previous=>[...previous,{role,text}]),
        onEnded:()=>{setStatus('Ended');setBusy(false);},
      });
      runner.current=client;await client.start();
      if(current!==generation.current)client.stop();
    } catch(error){setStatus(error.message);setBusy(false);}
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Test voice agent">
    <div className="w-full max-w-xl rounded-xl bg-background p-6 space-y-4">
      <h2 className="text-xl font-semibold">Test {agent.name}</h2>
      <p className="text-sm text-muted-foreground">Talk through your microphone using AssistantFleet. No telephone number is used. Tests end after two minutes.</p>
      <p aria-live="polite">{status}</p>
      <div className="max-h-64 overflow-auto space-y-2">{transcript.map((item,index)=><p key={index}><strong>{item.role}:</strong> {item.text}</p>)}</div>
      <div className="flex gap-2"><Button onClick={start} disabled={busy}>Start Test</Button><Button variant="outline" onClick={stop} disabled={!busy}>Stop</Button><Button variant="ghost" onClick={()=>{stop();onClose();}}>Close</Button></div>
    </div>
  </div>;
}
