import { useState } from 'react'
export const TokenLogo = ({ symbol, size = 28 }: { symbol: string; size?: number }) => {
  const [failed, setFailed] = useState(false)
  return (
    <span className="token-logo" style={{ width: size, height: size }}>
      {failed ? (
        symbol.slice(0, 2)
      ) : (
        <img
          src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(symbol)}.svg`}
          width={size}
          height={size}
          alt=""
          onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}
