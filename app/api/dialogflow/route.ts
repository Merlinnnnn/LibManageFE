import { SessionsClient } from '@google-cloud/dialogflow';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const KEY_PATH = path.join(process.cwd(), 'secrets', 'dialogflow-key.json');

export async function POST(req: NextRequest) {
  const { message, sessionId } = await req.json();

  try {
    const sessionClient = new SessionsClient({
      keyFilename: KEY_PATH,
    });

    const sessionPath = sessionClient.projectAgentSessionPath(
      'newagent-qquu',
      sessionId || 'default-session'
    );

    const [response] = await sessionClient.detectIntent({
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'vi',
        },
      },
    });

    const result = response.queryResult;
    console.log("ccccccccccccccccccccccccccccccccc", response.queryResult?.diagnosticInfo);
    // console.log("result", result)
    // console.log("================================================")
    // console.log('Full Dialogflow response:', JSON.stringify(response, null, 2));

    if (!result) {
      return NextResponse.json({ error: 'No query result returned' }, { status: 500 });
    }

    // ✅ Trích xuất suggestions dạng button nếu có
    const suggestions =
      result.fulfillmentMessages?.flatMap((msg) => {
        if (msg.platform === 'ACTIONS_ON_GOOGLE' && msg.suggestions?.suggestions) {
          return msg.suggestions.suggestions.map((s) => s.title);
        }
        return [];
      }) || [];

    // ✅ Trả về cả reply text và suggestions nếu có
    return NextResponse.json({
      reply: result.fulfillmentText || 'Không có phản hồi từ bot.',
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    });

  } catch (error) {
    console.error('Dialogflow error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
