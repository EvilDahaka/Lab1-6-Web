
import { usePresenceStore } from '@/stores/presenceStore';

interface OnlineStatusProps {
  userId: number | string;
}

function OnlineStatus({ userId }: OnlineStatusProps) {
  const isOnline = usePresenceStore((state) =>
    state.onlineUserIds.includes(String(userId))
  );

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />

      <span className={isOnline ? 'text-green-600' : 'text-gray-500'}>
        {isOnline ? 'Онлайн' : 'Офлайн'}
      </span>
    </span>
  );
}

export default OnlineStatus;
