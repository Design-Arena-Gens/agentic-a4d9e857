import { NextRequest, NextResponse } from 'next/server';
import { routeToTool, type ToolResult } from '../../../lib/tools';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: string = (body?.message || '').toString();
    if (!input) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }
    const toolResult: ToolResult = await routeToTool(input);

    const responseText = formatToolResult(toolResult);

    return NextResponse.json({
      ok: true,
      tool: toolResult.tool,
      args: toolResult.args,
      output: toolResult.output,
      message: responseText,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

function formatToolResult(result: ToolResult): string {
  switch (result.tool) {
    case 'calculator':
      return `Result: ${result.output}`;
    case 'wikipedia': {
      const o: any = result.output;
      if (!o || typeof o === 'string') return o || 'No result';
      const lines = [
        `"${o.title}" ? ${o.description || 'Wikipedia'}`,
        o.extract,
        `Source: ${o.url}`,
      ];
      return lines.filter(Boolean).join('\n');
    }
    case 'weather': {
      const o: any = result.output;
      if (!o || typeof o === 'string') return o || 'No result';
      const c = o.current || {};
      return [
        `Weather for ${o.location} (${o.timezone})`,
        `Temperature: ${c.temperature_2m}?C, Feels like: ${c.apparent_temperature}?C`,
        `Wind: ${c.wind_speed_10m} m/s`,
      ].join('\n');
    }
    default:
      return typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2);
  }
}
