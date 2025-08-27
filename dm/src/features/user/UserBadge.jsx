// dm/src/features/user/UserBadge.jsx
import { useWhoAmI, useDmStatus } from './useIdentity';

export default function UserBadge() {
    const { data: who, isLoading: wLoading } = useWhoAmI();
    const { data: dm, isLoading: dLoading, isError: dError } = useDmStatus();

    const email = who?.user ?? (wLoading ? '…' : 'unknown');
    const isDM = !!dm?.ok && dm?.role === 'dm' && !dError;

    return (
        <div className="userBadge" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="email">{email}</span>
            {dLoading ? (
                <span className="pill subtle" style={{ marginLeft: 4 }}>checking…</span>
            ) : isDM ? (
                <span className="pill dm" style={{ marginLeft: 4 }}>DM</span>
            ) : (
                <span className="pill subtle" style={{ marginLeft: 4 }}>Player</span>
            )}
        </div>
    );
}
