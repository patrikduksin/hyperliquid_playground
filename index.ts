async function getCandleCount() {
  // https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
  const url = 'https://api.hyperliquid.xyz/info';
  const body = {
    type: 'candleSnapshot',
    req: {
      coin: 'BTC',
      interval: '1d',
      startTime: 0,
      endTime: Date.now(),
    },
  };
  const start = performance.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const end = performance.now();
  console.log(`API request took ${end - start} ms`);
  if (!response.ok) {
    console.error('Failed to fetch candle data:', response.statusText);
    return;
  }

  const data = (await response.json()) as any;
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Unexpected response format or no candles:', data);
    return;
  }

  console.log(`Number of available 1d candles for BTC: ${data.length}`);

  // Date range for candles
  const timestamps = data.map((candle: any) => candle.t);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const minDate = new Date(minTimestamp).toLocaleString();
  const maxDate = new Date(maxTimestamp).toLocaleString();
  console.log(`Candle date range: ${minDate} - ${maxDate}`);

  // Find min and max prices and their times
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let minPriceTime = null;
  let maxPriceTime = null;
  for (const candle of data) {
    const low = parseFloat(candle.l);
    const high = parseFloat(candle.h);
    if (!isNaN(low) && low < minPrice) {
      minPrice = low;
      minPriceTime = candle.t;
    }
    if (!isNaN(high) && high > maxPrice) {
      maxPrice = high;
      maxPriceTime = candle.t;
    }
  }

  if (minPrice === Infinity || maxPrice === -Infinity) {
    console.log('Could not determine min/max prices.');
  } else {
    const minPriceDate = minPriceTime ? new Date(minPriceTime).toLocaleString() : 'N/A';
    const maxPriceDate = maxPriceTime ? new Date(maxPriceTime).toLocaleString() : 'N/A';
    console.log(`Min price: ${minPrice} at ${minPriceDate}`);
    console.log(`Max price: ${maxPrice} at ${maxPriceDate}`);
  }
}

getCandleCount().catch(console.error);