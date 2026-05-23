import React, { useState, useEffect } from 'react';
import { ShieldAlert, History, Loader2, Activity, Clock, Calendar } from 'lucide-react';
import api from '../../../services/api';
import { useTranslation } from '../../../hooks/useTranslation';

// Helper: turn JSON details into readable human text
const formatDetails = (details: any, targetId?: string): string => {
  if (!details && !targetId) return '—';
  if (!details) return `ID: ${targetId}`;
  const obj = typeof details === 'string' ? JSON.parse(details) : details;
  const parts = Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${String(v).slice(0, 40)}`);
  return parts.length > 0 ? parts.join(' · ') : JSON.stringify(obj).slice(0, 60);
};

const AuditLogsPage: React.FC = () => {
  const { t, lang, dir } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const getActionColor = (action: string) => {
    if (action?.includes('DELETE')) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (action?.includes('CREATE')) return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (action?.includes('UPDATE')) return 'text-primary bg-primary/10 border-primary/30';
    return 'text-text-muted bg-surface border-border';
  };

  const textAlignment = lang === 'ar' ? 'text-right' : 'text-left';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      <div className={textAlignment}>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-glow-primary">
          {t('dashboard.audit_logs.title')}
        </h2>
        <p className={`text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
          {t('dashboard.audit_logs.subtitle')}
          <ShieldAlert size={12} className="text-primary flex-shrink-0" />
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="glass rounded-2xl border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border/50 bg-background/40">
                  <th className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted ${textAlignment}`}>
                    {t('dashboard.audit_logs.table_admin')}
                  </th>
                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">
                    {t('dashboard.audit_logs.table_action')}
                  </th>
                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">
                    {t('dashboard.audit_logs.table_details')}
                  </th>
                  <th className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                    {t('dashboard.audit_logs.table_time')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {logs.map((log) => {
                  const createdAt = new Date(log.createdAt);
                  const timeStr = createdAt.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
                  const dateStr = createdAt.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');

                  return (
                    <tr key={log.id} className="group hover:bg-primary/5 transition-all">
                      {/* Admin column — avatar always first (right in RTL) */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar always rendered first in DOM = appears on start side */}
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                            {log.user?.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div className={textAlignment}>
                            <div className="text-xs font-black uppercase tracking-tight">
                              {log.user?.name || t('dashboard.audit_logs.system')}
                            </div>
                            <div className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                              {log.user?.role || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action column */}
                      <td className="px-5 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                          <Activity size={10} />
                          {log.action}
                        </div>
                      </td>

                      {/* Details column — human readable */}
                      <td className="px-5 py-4 text-center max-w-[220px]">
                        <p className="text-[10px] text-text-muted font-medium leading-relaxed truncate" title={JSON.stringify(log.details)}>
                          {formatDetails(log.details, log.targetId)}
                        </p>
                      </td>

                      {/* Time column — time on top, date below */}
                      <td className={`px-5 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                        <div className={`flex flex-col gap-0.5 ${lang === 'ar' ? 'items-start' : 'items-end'}`}>
                          <div className="flex items-center gap-1 text-[10px] font-black text-text-main">
                            <Clock size={9} className="text-primary/60 flex-shrink-0" />
                            <span>{timeStr}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-text-muted">
                            <Calendar size={9} className="text-border flex-shrink-0" />
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto border border-border opacity-30">
                <History size={28} />
              </div>
              <div className="space-y-1">
                <div className="text-lg font-black uppercase tracking-tighter text-glow-primary">
                  {t('dashboard.audit_logs.empty_title')}
                </div>
                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">
                  {t('dashboard.audit_logs.empty_subtitle')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
