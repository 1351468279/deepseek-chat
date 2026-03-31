import { describe, it, expect, vi } from 'vitest';
import {
  setupSSEHeaders,
  writeSSEChunk,
  writeSSEDone,
  writeSSError,
} from '../../src/utils/streamHandler.js';

describe('streamHandler Utility', () => {
  describe('setupSSEHeaders', () => {
    it('should set correct SSE headers', () => {
      const res = {
        setHeader: vi.fn(),
        writeHead: vi.fn(),
      };
      const mockRes = { ...res, end: vi.fn() };

      setupSSEHeaders(mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Accel-Buffering', 'no');
    });
  });

  describe('writeSSEChunk', () => {
    it('should write SSE chunk in correct format', () => {
      const res = {
        write: vi.fn().mockReturnValue(true),
      };

      writeSSEChunk(res, 'Hello');

      expect(res.write).toHaveBeenCalledWith('data: {"content":"Hello"}\n\n');
    });

    it('should handle empty content', () => {
      const res = {
        write: vi.fn().mockReturnValue(true),
      };

      writeSSEChunk(res, '');

      expect(res.write).toHaveBeenCalledWith('data: {"content":""}\n\n');
    });

    it('should handle special characters', () => {
      const res = {
        write: vi.fn().mockReturnValue(true),
      };

      writeSSEChunk(res, 'Hello\nWorld');

      expect(res.write).toHaveBeenCalledWith('data: {"content":"Hello\\nWorld"}\n\n');
    });

    it('should handle unicode characters', () => {
      const res = {
        write: vi.fn().mockReturnValue(true),
      };

      writeSSEChunk(res, '你好世界');

      expect(res.write).toHaveBeenCalledWith('data: {"content":"你好世界"}\n\n');
    });
  });

  describe('writeSSEDone', () => {
    it('should write SSE done signal', () => {
      const res = {
        write: vi.fn().mockReturnValue(true),
      };

      writeSSEDone(res);

      expect(res.write).toHaveBeenCalledWith('data: [DONE]\n\n');
    });
  });

  describe('writeSSError', () => {
    it('should write SSE error with message', () => {
      const res = {
        write: vi.fn().mockReturnValue(true),
      };

      const error = new Error('Test error');
      writeSSError(res, error);

      expect(res.write).toHaveBeenCalledWith('data: {"error":"Test error"}\n\n');
    });

    it('should handle error without message', () => {
      const res = {
        write: vi.fn().mockReturnValue(true),
      };

      const error = new Error();
      writeSSError(res, error);

      expect(res.write).toHaveBeenCalledWith('data: {"error":""}\n\n');
    });

    it('should handle string error', () => {
      const res = {
        write: vi.fn().mockReturnValue(true),
      };

      writeSSError(res, 'String error');

      expect(res.write).toHaveBeenCalledWith('data: {"error":"String error"}\n\n');
    });
  });
});
