/**
 * ============================================================================
 * COMMON UTILITY TYPES
 * ============================================================================
 * 
 * Additional TypeScript utility types for better type safety across the app
 * 
 * @author CryptoTrade Development Team
 * @version 1.0.0
 * ============================================================================
 */

/**
 * Makes all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Makes specified keys K of T required
 */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Extracts the type of array elements
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Creates a union of all possible dot-notation paths in an object
 */
export type DotNotation<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends object
    ? `${K}` | `${K}.${DotNotation<T[K]>}`
    : `${K}`
  : never;

/**
 * Generic async function type
 */
export type AsyncFunction<T = void, P extends unknown[] = []> = (...args: P) => Promise<T>;

/**
 * Event handler type for React components
 */
export type EventHandler<T = Event> = (event: T) => void;

/**
 * Component with children props
 */
export type WithChildren<T = {}> = T & {
  children?: React.ReactNode;
};

/**
 * Component with className prop
 */
export type WithClassName<T = {}> = T & {
  className?: string;
};

/**
 * Loading state type
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic API error type
 */
export interface ApiError {
  message: string;
  code?: string | number;
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Form field error type
 */
export interface FieldError {
  message: string;
  type?: string;
}

/**
 * Form validation errors
 */
export type FormErrors<T> = {
  [K in keyof T]?: FieldError;
};

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  borderRadius: number;
}

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification object
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * File upload status
 */
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * File upload result
 */
export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

/**
 * Search filters type
 */
export interface SearchFilters {
  query?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
}

/**
 * Sort configuration
 */
export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Table column definition
 */
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string | number;
}

/**
 * Modal props base type
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

/**
 * Menu item with icon
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: MenuItem[];
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

/**
 * Generic key-value pair
 */
export interface KeyValuePair<T = string> {
  key: string;
  value: T;
}

/**
 * Environment configuration
 */
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  API_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}