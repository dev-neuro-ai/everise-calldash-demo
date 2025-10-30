const {
  AccessToken,
  VideoGrant,
  AgentDispatchClient,
  EgressClient,
  EncodedFileOutput,
  S3Upload,
} = require("livekit-server-sdk");

module.exports = async function (context, req) {
  context.log('Processing connection-details request');

  // Set CORS headers
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  };

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    context.res.status = 204;
    return;
  }

  // Get environment variables
  const API_KEY = process.env.LIVEKIT_API_KEY;
  const API_SECRET = process.env.LIVEKIT_API_SECRET;
  const LIVEKIT_URL = process.env.LIVEKIT_URL;

  try {
    if (!LIVEKIT_URL) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (!API_KEY) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (!API_SECRET) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    const { userName, agentId, userId, dynamic_variables } = req.body;

    // Generate participant token
    const participantIdentity = `voice_assistant_user_${Math.floor(
      Math.random() * 10_000,
    )}`;
    const roomName = `voice_assistant_room_${Math.floor(
      Math.random() * 10_000,
    )}`;

    // Dispatch agent
    const agentName = "calldash-agent";
    const agentDispatchClient = new AgentDispatchClient(
      LIVEKIT_URL,
      API_KEY,
      API_SECRET,
    );

    const dispatchOptions = {
      metadata: JSON.stringify({
        agent_id: agentId,
        dynamic_variables: dynamic_variables || {},
      }),
    };

    const dispatch = await agentDispatchClient.createDispatch(
      roomName,
      agentName,
      dispatchOptions,
    );
    console.log("Dispatch created:", dispatch);

    // Start egress recording
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
    } catch (egressError) {
      console.error("Failed to start egress:", egressError);
    }

    // Create participant token
    const at = new AccessToken(API_KEY, API_SECRET, {
      identity: participantIdentity,
      name: userName,
      attributes: {
        agentId: agentId,
        userId: userId,
      },
      metadata: "this-is-metadata",
      ttl: "15m",
    });

    const grant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };
    at.addGrant(grant);
    const participantToken = await at.toJwt();

    // Return connection details
    context.res.body = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName: participantIdentity,
    };
    context.res.status = 200;

  } catch (error) {
    console.error(error);
    context.res.status = 500;
    context.res.body = { error: error.message };
  }
};