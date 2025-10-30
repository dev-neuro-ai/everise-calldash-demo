import {
  AccessToken,
  AccessTokenOptions,
  VideoGrant,
  AgentDispatchClient,
  EgressClient,
  EncodedFileOutput,
  S3Upload,
} from "livekit-server-sdk";
import { NextResponse } from "next/server";

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

interface RouteProps {
  userName: string;
  agentId: string;
  userId: string;
  dynamic_variables?: any;
}

export async function POST(req: Request) {
  const { userName, agentId, userId, dynamic_variables }: RouteProps = await req.json();

  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (API_KEY === undefined) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (API_SECRET === undefined) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    // Generate participant token
    const participantIdentity = `voice_assistant_user_${Math.floor(
      Math.random() * 10_000,
    )}`;
    const roomName = `voice_assistant_room_${Math.floor(
      Math.random() * 10_000,
    )}`;

    // Explicitly dispatch an agent to this room.
    // Ensure that the agent's WorkerOptions are configured with agentName = "inbound-agent"
    const agentName = "calldash-agent";
    const agentDispatchClient = new AgentDispatchClient(
      LIVEKIT_URL,
      API_KEY,
      API_SECRET,
    );

    // Enhanced dispatch options with dynamic variables
    const dispatchOptions = {
      metadata: JSON.stringify({
        agent_id: agentId,
        dynamic_variables: dynamic_variables || {},
      }),
    };

    // Create explicit dispatch
    const dispatch = await agentDispatchClient.createDispatch(
      roomName,
      agentName,
      dispatchOptions,
    );
    console.log("Dispatch created:", dispatch);

    // Start egress recording immediately after dispatch
    // This is the recommended approach for WebRTC rooms
    const egressClient = new EgressClient(LIVEKIT_URL, API_KEY, API_SECRET);

    try {
      const fileOutput = new EncodedFileOutput({
        filepath: `webrtc/${roomName}-{time}.mp4`,
        output: {
          case: "s3",
          value: new S3Upload({
            accessKey: process.env.AWS_ACCESS_KEY_ID || "",
            secret: process.env.AWS_SECRET_ACCESS_KEY || "",
            region: process.env.AWS_REGION || "us-west-1",
            bucket: process.env.AWS_S3_BUCKET || "gcs-livekit-recordings",
          }),
        },
      });

      const egressInfo = await egressClient.startRoomCompositeEgress(roomName, {
        file: fileOutput,
      });
      console.log("Egress started:", egressInfo);
      console.log("Egress ID:", egressInfo.egressId);
    } catch (egressError) {
      console.error("Failed to start egress:", egressError);
      // Continue even if egress fails - don't block the call
    }

    const participantToken = await createParticipantToken(
      {
        identity: participantIdentity,
        name: userName,
        attributes: {
          agentId: agentId,
          userId: userId,
        },
        metadata: "this-is-metadata",
      },
      roomName,
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName: participantIdentity,
    };
    const headers = new Headers({
      "Cache-Control": "no-store",
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: "15m",
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}
