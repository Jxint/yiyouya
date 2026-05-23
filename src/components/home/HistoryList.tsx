import { Link } from 'react-router-dom';
import type { TravelRecord, TravelSession } from '../../types';

interface HistoryListProps {
  records: TravelRecord[];
  currentSession?: TravelSession;
}

export function HistoryList({ records, currentSession }: HistoryListProps) {
  return (
    /* UI-only history presentation: data source and Link destinations stay owned by store/routes. */
    <section className="panel home-side-panel history-panel">
      <div className="panel-title-row">
        <div>
          <span className="eyebrow">History Log</span>
          <h2>历史足迹</h2>
        </div>
        <span className="panel-glyph" aria-hidden="true">
          ◷
        </span>
      </div>
      <div className="history-list">
        {currentSession && currentSession.status !== 'ended' && (
          <Link className="history-item active" to={`/travel/session/${currentSession.id}`}>
            <img className="history-thumb" src={currentSession.destination.coverImageUrl} alt="" />
            <span className="history-copy">
              <strong>{currentSession.destination.name}</strong>
              <span>未完成旅行</span>
              <small>点击继续对话</small>
            </span>
            <span className="history-tag">Live</span>
          </Link>
        )}
        {records.map((record) => (
          <Link className="history-item" to={`/travel/${record.id}`} key={record.id}>
            <img className="history-thumb" src={record.destination.coverImageUrl} alt="" />
            <span className="history-copy">
              <strong>{record.destination.name}</strong>
              <span>{record.endedAt ? new Date(record.endedAt).toLocaleDateString() : '未完成'}</span>
              <small>
                {record.destination.country} · 第 {record.travelIndex} 次旅行
              </small>
            </span>
            <span className="history-tag">{record.worldType === 'fantasy' ? 'Fantasy' : 'Real'}</span>
          </Link>
        ))}
        {records.length === 0 && !currentSession && (
          <div className="empty-state compact">
            <p className="muted">还没有旅行记录。</p>
            <small>让宠物第一次替你出发，足迹会在这里亮起来。</small>
          </div>
        )}
      </div>
    </section>
  );
}
