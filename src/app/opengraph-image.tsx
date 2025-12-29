import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Owen Gretzinger";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const [bricolage500, bricolage400] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9U6as8bTXq_nANBjzKo3IeZx8z6up5BeSl5jBNz_19PpbpMXuECpwUxJBOm_OJWiaaD30YfKfjZZoLvSniyM0.ttf"
    ).then((res) => res.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9U6as8bTXq_nANBjzKo3IeZx8z6up5BeSl5jBNz_19PpbpMXuECpwUxJBOm_OJWiaaD30YfKfjZZoLvRviyM0.ttf"
    ).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#141414",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Bricolage Grotesque",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
          }}
        >
          <img
            src="https://owengretzinger.com/pfp.png"
            alt="owen gretzinger"
            width={150}
            height={150}
            style={{
              borderRadius: 24,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 20,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 500,
                color: "#ffffff",
                marginBottom: 8,
              }}
            >
              owen gretzinger
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 400,
                color: "#a3a3a3",
              }}
            >
              founding engineer @ boardy
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Bricolage Grotesque",
          data: bricolage500,
          style: "normal",
          weight: 500,
        },
        {
          name: "Bricolage Grotesque",
          data: bricolage400,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
