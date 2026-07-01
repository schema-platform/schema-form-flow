import { describe, it, expect } from 'vitest'
import { generateThumbnail } from '../composables/useFlowThumbnail.js'

function decodeSvg(dataUrl: string): string {
  const b64 = dataUrl.split(',')[1]
  return decodeURIComponent(escape(atob(b64)))
}

describe('generateThumbnail', () => {
  it('returns empty string when graph has no nodes', () => {
    expect(generateThumbnail({ nodes: [], edges: [] })).toBe('')
  })

  it('produces fixed-size SVG that fits all nodes', () => {
    const graph = {
      nodes: [
        { id: '1', shape: 'bpmn-start-event', x: 0, y: 0, width: 200, height: 36, data: {} },
        { id: '2', shape: 'bpmn-user-task', x: 80, y: 500, width: 160, height: 80, data: {} },
        { id: '3', shape: 'bpmn-end-event', x: 800, y: 100, width: 200, height: 36, data: {} },
      ],
      edges: [
        { id: 'e1', source: { cell: '1' }, target: { cell: '2' } },
        { id: 'e2', source: { cell: '2' }, target: { cell: '3' } },
      ],
    }

    const thumb = generateThumbnail(graph)
    expect(thumb.startsWith('data:image/svg+xml;base64,')).toBe(true)

    const svg = decodeSvg(thumb)
    expect(svg).toContain('width="280"')
    expect(svg).toContain('height="120"')
    expect(svg).toContain('<g transform="translate(')
    expect(svg).toContain('scale(')
    expect(svg).toContain('<rect x="0" y="0"')
    expect(svg).toContain('<line x1=')
    expect(svg).toContain('stroke-dasharray=')
  })
})
