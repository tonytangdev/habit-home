import { NextResponse } from 'next/server';
import { APIResponse } from './validations';

export function successResponse<T>(data: T, status: number = 200): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data
  }, { status });
}

export function errorResponse(
  error: string, 
  status: number = 500, 
  details?: any
): NextResponse<APIResponse> {
  return NextResponse.json({
    success: false,
    error,
    details
  }, { status });
}

export function validationErrorResponse(details: any): NextResponse<APIResponse> {
  return NextResponse.json({
    success: false,
    error: '輸入驗證失敗',
    details
  }, { status: 400 });
}

export function unauthorizedResponse(message: string = '未授權訪問'): NextResponse<APIResponse> {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 401 });
}

export function forbiddenResponse(message: string = '訪問被拒絕'): NextResponse<APIResponse> {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 403 });
}

export function notFoundResponse(message: string = '資源未找到'): NextResponse<APIResponse> {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 404 });
}