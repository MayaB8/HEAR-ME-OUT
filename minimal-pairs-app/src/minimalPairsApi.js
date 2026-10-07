const apiBaseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "");


export async function getMinimalPairs(exerciseType = "אופן חיתוך", soundPair, position) {
  // build request
    const params = new URLSearchParams();

    params.append("exerciseType", exerciseType);

    if(soundPair != null && soundPair !== "הכל")
        params.append("soundPair", soundPair);

    if(position != null && position !== "הכל")
        params.append("position", position);


    if (!apiBaseUrl) {
        throw new Error("Set REACT_APP_API_BASE_URL in minimal-pairs-app/.env");
    }
    const url = `${apiBaseUrl}/api/minimal-pairs?${params.toString()}`;

    // fetch
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch minimal pairs");
    }

    const data = await response.json();

  // return data
    return data;
}
