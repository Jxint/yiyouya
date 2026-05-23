import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DiaryList } from '../../components/travel/DiaryList';
import { MessageList } from '../../components/travel/MessageList';
import { useAppStore } from '../../store/appStore';

export function TravelDetailPage() {
  const { travelId } = useParams();
  const record = useAppStore((state) => state.travelHistory.find((travel) => travel.id === travelId));
  const [showConversation, setShowConversation] = useState(false);

  if (!record) {
    return (
      <section className="panel">
        <h2>没有找到旅行记录</h2>
        <Link to="/">返回首页</Link>
      </section>
    );
  }

  return (
    <div className="detail-page">
      <div className="session-toolbar">
        <div>
          <h2>{record.destination.name}</h2>
          <p>
            {record.destination.country} · {record.endedAt ? new Date(record.endedAt).toLocaleDateString() : '未完成'} · 第 {record.travelIndex} 次旅行
          </p>
        </div>
        <Link to="/">返回首页</Link>
      </div>
      <section className="panel">
        <h2>旅行概览</h2>
        <p>{record.destination.description}</p>
        <div className="tag-row">
          {record.destination.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>
      <DiaryList entries={record.diaryEntries} />
      <section className="panel">
        <h2>旅行图片</h2>
        <div className="image-strip">
          {[record.destination.coverImageUrl, ...record.destination.imageUrls].map((url) => (
            <img src={url} alt={record.destination.name} key={url} />
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="modal-actions">
          <h2>当时的对话</h2>
          <button type="button" onClick={() => setShowConversation((visible) => !visible)}>
            {showConversation ? '收起对话' : '查看当时对话'}
          </button>
        </div>
        {showConversation && <MessageList messages={record.messages} />}
      </section>
      <section className="panel">
        <h2>轻量反馈</h2>
        <input placeholder="写一点对这次旅行的反馈" />
        <p>亲密值变化：+{record.intimacyDelta}</p>
      </section>
    </div>
  );
}
