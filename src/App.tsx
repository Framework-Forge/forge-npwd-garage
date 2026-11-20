import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, IconButton, LinearProgress, Stack, Typography, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { fetchNui } from './utils/fetchNui';
import type { GarageVehicle, NuiResponse, VehicleFine, VehicleState, VehicleType } from './types';

const ACCENT = '#ff790e';
const colors: Record<VehicleState, string> = {out:'#f6b94f',garaged:'#45d19e',insurance:'#ef9d61',impounded:'#f67575',unknown:'#aaa'};
const stateNames = {all:'Todas as situações',garaged:'Na garagem',out:'Fora da garagem',insurance:'Seguro',impounded:'Apreendidos',total_loss:'Perda total',unknown:'Desconhecidos'};
const typeNames = {all:'Todos',car:'Carros',bike:'Motos',boat:'Barcos',aircraft:'Aeronaves'};
const fineNames: Record<string,string> = {parking:'Parquímetro',police_fine:'Multa policial',impound:'Apreensão'};
const fineStatus: Record<string,string> = {active:'Pendente',processing:'Em processamento',paid:'Paga',cancelled:'Cancelada',resolved:'Regularizada'};
const money = (n?: number) => typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) : 'Não informado';
const date = (n?: number) => n && Number.isFinite(n) ? new Date(n*1000).toLocaleString('pt-BR') : 'Não informado';
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'');
const errorText = (e: unknown) => e instanceof Error ? e.message : 'Não foi possível consultar a garagem.';
const distance = (n?: number) => n == null ? '' : n >= 1000 ? `${(n/1000).toFixed(1)} km` : `${n} m`;

function VehicleImage({vehicle, large=false}: {vehicle: GarageVehicle; large?: boolean}) {
  const [index,setIndex] = useState(0);
  const candidates = (Array.isArray(vehicle.images) ? vehicle.images : []).filter(url => typeof url === 'string' && /^https?:\/\//.test(url));
  const signature = candidates.join('|');
  useEffect(()=>setIndex(0),[signature]);
  return <Box sx={{height:large?170:100,display:'grid',placeItems:'center',background:'radial-gradient(ellipse at center,rgba(255,121,14,.13),transparent 75%)',overflow:'hidden'}}>
    {index < candidates.length ? <Box component="img" src={candidates[index]} alt={vehicle.fullname || vehicle.model} onError={()=>setIndex(i=>i+1)} sx={{width:'100%',height:'100%',objectFit:'contain'}}/> : <Stack alignItems="center" sx={{opacity:.6}}><DirectionsCarRoundedIcon sx={{fontSize:large?72:50,color:ACCENT}}/>{large && <Typography variant="caption">Imagem indisponível</Typography>}</Stack>}
  </Box>;
}
function Meter({label,value,source}: {label:string;value?:number|null;source?:string}) {
  const valid = typeof value==='number' && Number.isFinite(value);
  const safe = valid ? Math.max(0,Math.min(100,value)) : 0;
  return <Box sx={{flex:1,minWidth:0}}><Typography sx={{fontSize:11,mb:.5}}>{label} <b>{valid?`${Math.round(safe)}%`:'—'}</b></Typography>
    <LinearProgress variant="determinate" value={safe} sx={{height:5,borderRadius:4,bgcolor:'rgba(127,127,127,.2)','& .MuiLinearProgress-bar':{bgcolor:valid&&safe<25?'#f67575':ACCENT}}}/>
    <Typography sx={{fontSize:9,opacity:.6,mt:.4}}>{!valid?'Não informado':source==='live'?'Atual':'Último registro'}</Typography></Box>;
}
function Status({vehicle}: {vehicle:GarageVehicle}) {
  return <Stack direction="row" spacing={.5} flexWrap="wrap" useFlexGap>
    <Chip size="small" label={vehicle.state} sx={{color:colors[vehicle.stateCode]||colors.unknown,bgcolor:`${colors[vehicle.stateCode]||colors.unknown}18`,fontWeight:700,fontSize:10}}/>
    {vehicle.conditionCode==='total_loss' && <Chip size="small" label="Perda total" sx={{color:'#f67575',bgcolor:'#f6757518',fontWeight:700,fontSize:10}}/>}
  </Stack>;
}
function RouteButton({vehicle}: {vehicle:GarageVehicle}) {
  const [busy,setBusy] = useState(false);
  const [feedback,setFeedback] = useState<{ok:boolean;text:string}|null>(null);
  const route = async()=>{
    setBusy(true);setFeedback(null);
    try {
      const response = await fetchNui<NuiResponse>('forge-npwd:garage:requestWaypoint',{plate:vehicle.plate});
      setFeedback({ok:response.status==='ok',text:response.message || (response.status==='ok'?'Rota definida.':'Localização indisponível.')});
    } catch(e){setFeedback({ok:false,text:errorText(e)});} finally {setBusy(false);}
  };
  return <Box><Button fullWidth size="small" variant="outlined" onClick={()=>void route()} disabled={busy || vehicle.disableTracking} startIcon={busy?<CircularProgress size={14}/>:<LocationOnRoundedIcon/>} sx={{color:ACCENT,borderColor:'rgba(255,121,14,.5)',py:1}}>
    {vehicle.destination?.action || 'Localização indisponível'}</Button>
    {vehicle.disableTracking && <Typography variant="caption" sx={{display:'block',opacity:.7,mt:.7}}>{vehicle.routeUnavailable}</Typography>}
    {feedback && <Alert severity={feedback.ok?'success':'error'} sx={{mt:1,fontSize:12}}>{feedback.text}</Alert>}
  </Box>;
}
function Field({name,value}: {name:string;value:React.ReactNode}) {
  return <Box sx={{py:.7}}><Typography sx={{fontSize:10,opacity:.65,textTransform:'uppercase',letterSpacing:.7}}>{name}</Typography><Typography sx={{fontSize:13,overflowWrap:'anywhere'}}>{value ?? 'Não informado'}</Typography></Box>;
}
function Fine({fine}: {fine:VehicleFine}) {
  return <Accordion disableGutters elevation={0} sx={{background:'transparent',border:'1px solid rgba(127,127,127,.22)',borderRadius:'10px!important','&:before':{display:'none'}}}>
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>}><Box sx={{width:'100%',minWidth:0}}><Stack direction="row" justifyContent="space-between" gap={1}><Typography sx={{fontSize:12,fontWeight:700}}>{fineNames[fine.kind]||'Multa veicular'}</Typography><Typography sx={{fontSize:12,fontWeight:800,color:ACCENT}}>{money(fine.total??fine.amount)}</Typography></Stack><Typography sx={{fontSize:10,opacity:.7}}>{fineStatus[fine.status]||'Situação não informada'} · {date(fine.issuedAt)}</Typography></Box></AccordionSummary>
    <AccordionDetails sx={{pt:0}}><Field name="Descrição / infrações" value={fine.description}/><Field name="Local" value={fine.location || 'Não registrado'}/>
      {!!fine.laws?.length && <Field name="Artigos" value={fine.laws.join(', ')}/>}
      {fine.occurredTime && <Field name="Horário registrado no jogo" value={fine.occurredTime}/>}
      <Field name="Valor original" value={money(fine.amount)}/>
      {fine.invoiceAvailable && <><Field name="Valor da fatura" value={money(fine.total)}/><Field name="Vencimento" value={date(fine.dueAt)}/>
        {!!fine.interestRate && <Field name="Juros" value={`${fine.interestRate}% por ${fine.interestInterval==='day'?'dia':fine.interestInterval==='hour'?'hora':fine.interestInterval || 'período'}`}/>}</>}
      {fine.paidAt && <Field name="Pagamento" value={date(fine.paidAt)}/>}
      {!fine.invoiceAvailable && <Typography variant="caption" sx={{opacity:.65}}>Valor registrado. Eventuais juros e dados de pagamento da fatura não estão disponíveis.</Typography>}
    </AccordionDetails></Accordion>;
}
function Details({plate,onBack}: {plate:string;onBack:()=>void}) {
  const [vehicle,setVehicle] = useState<GarageVehicle|null>(null);
  const [error,setError] = useState('');
  const [revision,setRevision] = useState(0);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
    let active = true; setLoading(true);setError('');setVehicle(null);
    fetchNui<NuiResponse<GarageVehicle>>('forge-npwd:garage:getDetails',{plate}).then(response=>{
      if(response.status!=='ok'||!response.data) throw new Error(response.message||'Detalhes indisponíveis.');
      if(active)setVehicle(response.data);
    }).catch(e=>{if(active)setError(errorText(e));}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[plate,revision]);
  const fines = Array.isArray(vehicle?.fines) ? vehicle.fines : [];
  const outstanding = fines.filter(f=>f.status==='active'||f.status==='processing');
  return <Box data-testid="vehicle-details"><Stack direction="row" alignItems="center" spacing={1} mb={1}>
    <IconButton aria-label="Voltar à lista" onClick={onBack}><ArrowBackRoundedIcon/></IconButton><Box flex={1}><Typography fontWeight={800}>Meu veículo</Typography><Typography variant="caption">{plate}</Typography></Box>
    <IconButton aria-label="Atualizar detalhes" disabled={loading} onClick={()=>setRevision(n=>n+1)}><RefreshRoundedIcon/></IconButton></Stack>
    {loading && <Box sx={{display:'grid',placeItems:'center',py:8}}><CircularProgress sx={{color:ACCENT}}/></Box>}
    {error && <Alert severity="error" action={<Button onClick={()=>setRevision(n=>n+1)}>Tentar novamente</Button>}>{error}</Alert>}
    {vehicle && <Stack spacing={2}>
      <Box><VehicleImage key={vehicle.plate} vehicle={vehicle} large/><Typography fontSize={20} fontWeight={900}>{vehicle.fullname}</Typography><Typography variant="caption" sx={{opacity:.6}}>{vehicle.spawnName} · {vehicle.plate}</Typography><Box mt={1}><Status vehicle={vehicle}/></Box></Box>
      <Box sx={{border:'1px solid rgba(255,121,14,.3)',borderRadius:2,p:1.5}}><Typography fontSize={13} fontWeight={800} mb={1}>Condição do veículo</Typography><Stack direction="row" spacing={1}>
        <Meter label="Combustível" value={vehicle.fuel} source={vehicle.fuelSource}/><Meter label="Motor" value={vehicle.engine==null?null:vehicle.engine/10} source={vehicle.engineSource}/><Meter label="Carroceria" value={vehicle.body==null?null:vehicle.body/10} source={vehicle.bodySource}/></Stack>
        <Typography sx={{mt:1,fontSize:12,color:vehicle.conditionCode==='total_loss'?'#f67575':'inherit'}}>{vehicle.condition}</Typography>
        {vehicle.conditionCode==='total_loss' && <Typography sx={{fontSize:11,opacity:.7,mt:.5}}>Motor ou carroceria em 0% ou menos na condição disponível. A recuperação segue as regras da garagem e do seguro.</Typography>}
      </Box>
      <Box><Typography fontSize={13} fontWeight={800}>Localização e retirada</Typography><Field name="Situação" value={vehicle.state}/>
        <Field name={vehicle.stateCode==='garaged'?'Garagem':'Destino'} value={vehicle.destination?.label || (vehicle.stateCode==='impounded'?vehicle.impound?.garage:'Não localizado')}/>
        {vehicle.destination?.distance!=null && <Typography sx={{fontSize:11,opacity:.7,mb:1}}>Aproximadamente {distance(vehicle.destination.distance)} em linha reta.</Typography>}
        {vehicle.stateCode==='insurance' && <Alert severity="info" sx={{mb:1,fontSize:12}}>Veículo não encontrado no mundo. Procure o seguro indicado para consultar a recuperação.</Alert>}
        {vehicle.stateCode==='impounded' && <Box sx={{mb:1}}><Field name="Motivo da apreensão" value={vehicle.impound?.reason || 'Não informado'}/><Field name="Taxa de apreensão" value={money(vehicle.impound?.amount)}/><Field name="Situação da taxa" value={vehicle.impound?(vehicle.impound.paid?'Paga':'Pendente'):'Não informada'}/><Field name="Retenção até" value={date(vehicle.impound?.holdUntil)}/><Alert severity="info" sx={{fontSize:12}}>A retirada depende da liberação no pátio e das regras da polícia. Marcar a rota não libera o veículo.</Alert></Box>}
        <RouteButton key={`${vehicle.plate}:${revision}`} vehicle={vehicle}/>
      </Box>
      {vehicle.paymentsleft!=null && vehicle.paymentsleft>0 && <Field name="Parcelas restantes do financiamento" value={vehicle.paymentsleft}/>}
      <Divider/><Box><Typography fontSize={15} fontWeight={800}>Multas e cobranças</Typography><Typography sx={{fontSize:12,opacity:.7,mt:.5,mb:1.3}}>{fines.length} registro(s) · {outstanding.length} pendente(s) · {money(outstanding.reduce((s,f)=>s+(f.total??f.amount),0))}</Typography>
        {(Array.isArray(vehicle.warnings)?vehicle.warnings:[]).map(message=><Alert key={message} severity="warning" sx={{mb:1,fontSize:11}}>{message}</Alert>)}
        {!fines.length && <Typography sx={{fontSize:12,opacity:.7}}>Nenhuma multa retornada pelas fontes disponíveis.</Typography>}
        <Stack spacing={1}>{fines.map(fine=><Fine key={fine.id} fine={fine}/>)}</Stack>
      </Box><Typography sx={{fontSize:10,opacity:.55,pb:2}}>Consultado em {date(vehicle.observedAt)}. Valores identificados como último registro podem diferir da condição atual.</Typography>
    </Stack>}
  </Box>;
}
function VehicleCard({vehicle,onDetails}: {vehicle:GarageVehicle;onDetails:()=>void}) {
  return <Box sx={{p:1.5,borderRadius:2.5,border:'1px solid rgba(255,121,14,.22)',bgcolor:'rgba(127,127,127,.045)'}}>
    <Box component="button" aria-label={`Detalhes de ${vehicle.plate}`} onClick={onDetails} sx={{border:0,p:0,width:'100%',color:'inherit',background:'transparent',cursor:'pointer',textAlign:'left','&:focus-visible':{outline:`2px solid ${ACCENT}`,borderRadius:1}}}>
      <VehicleImage vehicle={vehicle}/><Typography fontSize={15} fontWeight={800}>{vehicle.fullname}</Typography><Typography sx={{fontSize:11,opacity:.65,mb:1}}>Placa: {vehicle.plate}</Typography><Status vehicle={vehicle}/>
    </Box>
    <Typography sx={{display:'flex',alignItems:'center',gap:.6,fontSize:12,mt:1.2,mb:1.2,overflowWrap:'anywhere'}}><LocationOnRoundedIcon sx={{fontSize:16,color:ACCENT}}/>{vehicle.destination?.label || vehicle.state}</Typography>
    <Stack direction="row" spacing={1} mb={1.5}><Meter label="Combustível" value={vehicle.fuel} source={vehicle.fuelSource}/><Meter label="Motor" value={vehicle.engine==null?null:vehicle.engine/10} source={vehicle.engineSource}/></Stack>
    <Button fullWidth size="small" startIcon={<InfoOutlinedIcon/>} onClick={onDetails} sx={{mb:.8,color:ACCENT}}>Informações detalhadas</Button><RouteButton vehicle={vehicle}/>
  </Box>;
}
export default function App({theme}: {theme:{palette?:{mode?:string}}}) {
  const history = useHistory(); const dark=theme?.palette?.mode==='dark';
  const [vehicles,setVehicles]=useState<GarageVehicle[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  const [query,setQuery]=useState('');const [filter,setFilter]=useState<VehicleType|'all'>('all');
  const [state,setState]=useState<keyof typeof stateNames>('all');const [selected,setSelected]=useState<string|null>(null);
  const load=useCallback(async()=>{setLoading(true);setError('');try {
    const response=await fetchNui<NuiResponse<GarageVehicle[]>>('forge-npwd:garage:getVehicles');
    if(response.status!=='ok')throw new Error(response.message||'Falha ao carregar veículos.');setVehicles(Array.isArray(response.data)?response.data:[]);
  } catch(e){setError(errorText(e));}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]);
  const visible=useMemo(()=>vehicles.filter(v=>(filter==='all'||v.type===filter)&&(state==='all'||(state==='total_loss'?v.conditionCode==='total_loss':v.stateCode===state))&&(!query||normalize(`${v.plate} ${v.fullname} ${v.model} ${v.spawnName}`).includes(normalize(query)))),[vehicles,filter,state,query]);
  return <Box sx={{height:'100%',overflow:'auto',boxSizing:'border-box',p:1.7,color:dark?'#eee':'#202020',bgcolor:dark?'#111214':'#f5f5f5','& .MuiIconButton-root':{color:'inherit'},'& .MuiAccordion-root':{color:'inherit'},'& .MuiAccordionSummary-expandIconWrapper':{color:'inherit'}}}>
    {selected?<Details key={selected} plate={selected} onBack={()=>setSelected(null)}/>:<>
      <Stack direction="row" alignItems="center" spacing={1} mb={1.7}><IconButton aria-label="Voltar ao telefone" onClick={()=>history.goBack()}><ArrowBackRoundedIcon/></IconButton><Box flex={1}><Typography sx={{fontSize:9,letterSpacing:2,color:ACCENT,fontWeight:800}}>FORGEBOX</Typography><Typography fontSize={20} fontWeight={900}>Meus veículos</Typography><Typography sx={{fontSize:10,opacity:.65}}>{vehicles.length} veículo(s) na sua conta</Typography></Box><IconButton aria-label="Atualizar veículos" disabled={loading} onClick={()=>void load()}><RefreshRoundedIcon/></IconButton></Stack>
      <TextField fullWidth size="small" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar placa ou modelo" inputProps={{'aria-label':'Buscar placa ou modelo'}} InputProps={{startAdornment:<InputAdornment position="start"><SearchRoundedIcon sx={{color:ACCENT,fontSize:19}}/></InputAdornment>}} sx={{mb:1.2,'& input':{color:'inherit',fontSize:13},'& .MuiOutlinedInput-root':{color:'inherit',borderRadius:2},'& fieldset':{borderColor:'rgba(127,127,127,.35)'}}}/>
      <Stack direction="row" spacing={.6} sx={{overflowX:'auto',pb:1}}>{(Object.keys(typeNames) as (keyof typeof typeNames)[]).map(value=><Chip key={value} size="small" label={typeNames[value]} onClick={()=>setFilter(value)} sx={{color:filter===value?'#111':'inherit',bgcolor:filter===value?ACCENT:'rgba(127,127,127,.12)',fontWeight:700,fontSize:11}}/>)}</Stack>
      <TextField select fullWidth size="small" value={state} onChange={e=>setState(e.target.value as keyof typeof stateNames)} SelectProps={{native:true}} inputProps={{'aria-label':'Filtrar situação'}} sx={{mb:1.5,'& .MuiInputBase-root':{color:'inherit',fontSize:12},'& option':{color:'#222'},'& fieldset':{borderColor:'rgba(127,127,127,.35)'},'& .MuiSvgIcon-root':{color:'inherit'}}}>{Object.entries(stateNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}</TextField>
      {loading?<Box sx={{display:'grid',placeItems:'center',py:8}}><CircularProgress sx={{color:ACCENT}}/></Box>:error?<Alert severity="error" action={<Button onClick={()=>void load()}>Tentar novamente</Button>}>{error}</Alert>:<>
        {!visible.length&&<Alert severity="info">Nenhum veículo encontrado nesta busca.</Alert>}
        <Stack spacing={1.5}>{visible.map(vehicle=><VehicleCard key={vehicle.plate} vehicle={vehicle} onDetails={()=>setSelected(vehicle.plate)}/>)}</Stack>
      </>}
    </>}
  </Box>;
}
