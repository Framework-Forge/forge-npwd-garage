import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GarageVehicle, NuiResponse } from '../types';
import { fetchNui } from '../utils/fetchNui';

interface WidgetProps { width: number; height: number }
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const GarageWidget: React.FC<WidgetProps> = ({ width, height }) => {
  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [loaded, setLoaded] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetchNui<NuiResponse<GarageVehicle[]>>('forge-npwd:garage:getVehicles');
      if (response.status === 'ok') setVehicles(Array.isArray(response.data) ? response.data : []);
    } finally { setLoaded(true); }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(refresh, 30000);
    const onMessage = (event: MessageEvent) => {
      if (/garage|vehicle/i.test(String(event.data?.action || event.data?.method || ''))) void refresh();
    };
    window.addEventListener('message', onMessage);
    return () => { window.clearInterval(timer); window.removeEventListener('message', onMessage); };
  }, [refresh]);

  const stats = useMemo(() => ({
    garaged: vehicles.filter((v) => v.stateCode === 'garaged').length,
    out: vehicles.filter((v) => v.stateCode === 'out').length,
    insurance: vehicles.filter((v) => v.stateCode === 'insurance').length,
    impounded: vehicles.filter((v) => v.stateCode === 'impounded').length,
    totalLoss: vehicles.filter((v) => v.conditionCode === 'total_loss').length,
  }), [vehicles]);
  const outstanding = useMemo(() => vehicles.flatMap((v) => v.fines || []).filter((f) => f.status === 'active' || f.status === 'processing'), [vehicles]);
  const fineTotal = outstanding.reduce((sum, fine) => sum + (fine.total ?? fine.amount ?? 0), 0);
  const attention = useMemo(() => [...vehicles].sort((a, b) => {
    const score = (v: GarageVehicle) => (v.stateCode === 'impounded' ? 4 : 0) + (v.conditionCode === 'total_loss' ? 3 : 0) + (v.stateCode === 'insurance' ? 2 : 0) + (v.stateCode === 'out' ? 1 : 0);
    return score(b) - score(a);
  }).slice(0, 3), [vehicles]);
  const compact = width === 2 && height === 1;

  return (
    <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden', borderRadius: 16, padding: compact ? '9px 11px' : '10px 14px', color: '#fff', background: 'linear-gradient(145deg,#27272a,#111)', border: '1px solid rgba(255,121,14,.35)', boxShadow: '0 10px 24px rgba(0,0,0,.3)', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 10, fontWeight: 800, color: '#ff790e', letterSpacing: '.08em' }}>FORGE GARAGE</span><span style={{ fontSize: 9, opacity: .65 }}>{loaded ? `${vehicles.length} veículos` : 'Atualizando…'}</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 5, marginTop: 7 }}>
        {[[stats.garaged,'Guardados','#45d19e'],[stats.out,'Na rua','#f6b94f'],[stats.insurance,'Seguro','#ef9d61'],[stats.impounded,'Apreendidos','#f67575']].slice(0, compact ? 2 : 4).map(([value,label,color]) => <div key={String(label)} style={{ borderRadius: 8, padding: '5px 4px', textAlign: 'center', background: 'rgba(255,255,255,.055)' }}><div style={{ fontSize: 17, fontWeight: 800, color: String(color), lineHeight: 1 }}>{value}</div><div style={{ marginTop: 3, fontSize: 8, opacity: .65 }}>{label}</div></div>)}
      </div>
      {!compact && height === 1 && <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 9 }}><span style={{ color: stats.totalLoss ? '#fca5a5' : '#aaa' }}>{stats.totalLoss ? `${stats.totalLoss} perda(s) total(is)` : 'Nenhuma perda total'}</span><span style={{ color: fineTotal ? '#fbbf24' : '#aaa' }}>{outstanding.length ? `${outstanding.length} multa(s) · ${money(fineTotal)}` : 'Sem multas pendentes'}</span></div>}
      {height >= 2 && <div style={{ marginTop: 7, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700 }}><span style={{ opacity: .55 }}>VEÍCULOS EM DESTAQUE</span><span style={{ color: fineTotal ? '#fbbf24' : '#aaa' }}>{outstanding.length ? `${money(fineTotal)} pendente` : 'Sem pendências'}</span></div>
        {attention.map((vehicle) => <div key={vehicle.plate} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 5, fontSize: 9 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><b>{vehicle.fullname}</b> · {vehicle.plate}</span><span style={{ color: vehicle.stateCode === 'impounded' || vehicle.conditionCode === 'total_loss' ? '#f67575' : '#d4d4d8' }}>{vehicle.conditionCode === 'total_loss' ? 'Perda total' : vehicle.state}</span></div>)}
        {!attention.length && <div style={{ marginTop: 8, fontSize: 9, opacity: .55 }}>Nenhum veículo cadastrado.</div>}
      </div>}
    </div>
  );
};
