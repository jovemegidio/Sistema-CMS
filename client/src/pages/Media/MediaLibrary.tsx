import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Trash2, Search, Image, File, X } from 'lucide-react';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import { showToast, ToastContainer } from '../../components/Toast';
import { format } from 'date-fns';

interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  uploaded_by_name: string;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const response = await api.get('/media', { params });
      setMedia(response.data.media);
    } catch {
      showToast('Failed to load media', 'error');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('File uploaded successfully', 'success');
      fetchMedia();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/media/${deleteId}`);
      showToast('File deleted successfully', 'success');
      if (selectedMedia?.id === deleteId) setSelectedMedia(null);
      fetchMedia();
    } catch {
      showToast('Failed to delete file', 'error');
    }
    setDeleteId(null);
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Media Library</h1>
          <p className="page-subtitle">Upload and manage your media files</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="loading-spinner small" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>

      <div className="media-toolbar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="media-layout">
        <div className="media-grid">
          {loading ? (
            <div className="media-loading">
              <div className="loading-spinner large" />
            </div>
          ) : media.length === 0 ? (
            <div className="media-empty">
              <Image size={48} />
              <p>No media files found</p>
              <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                Upload your first file
              </button>
            </div>
          ) : (
            media.map((item) => (
              <div
                key={item.id}
                className={`media-card ${selectedMedia?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedMedia(item)}
              >
                {isImage(item.mime_type) ? (
                  <div className="media-preview">
                    <img src={item.url} alt={item.original_name} />
                  </div>
                ) : (
                  <div className="media-preview file-preview">
                    <File size={32} />
                    <span>{item.mime_type.split('/')[1]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="media-info">
                  <span className="media-name" title={item.original_name}>
                    {item.original_name}
                  </span>
                  <span className="media-size">{formatFileSize(item.size)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedMedia && (
          <div className="media-detail">
            <div className="media-detail-header">
              <h3>File Details</h3>
              <button className="icon-btn" onClick={() => setSelectedMedia(null)}>
                <X size={18} />
              </button>
            </div>

            {isImage(selectedMedia.mime_type) ? (
              <div className="media-detail-preview">
                <img src={selectedMedia.url} alt={selectedMedia.original_name} />
              </div>
            ) : (
              <div className="media-detail-preview file-preview">
                <File size={48} />
              </div>
            )}

            <div className="media-detail-info">
              <div className="detail-row">
                <span className="detail-label">Name</span>
                <span className="detail-value">{selectedMedia.original_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type</span>
                <span className="detail-value">{selectedMedia.mime_type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Size</span>
                <span className="detail-value">{formatFileSize(selectedMedia.size)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Uploaded by</span>
                <span className="detail-value">{selectedMedia.uploaded_by_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value">
                  {format(new Date(selectedMedia.created_at), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">URL</span>
                <input type="text" readOnly value={selectedMedia.url} className="detail-url" />
              </div>
            </div>

            <button
              className="btn btn-danger btn-full"
              onClick={() => setDeleteId(selectedMedia.id)}
            >
              <Trash2 size={16} />
              Delete File
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ToastContainer />
    </div>
  );
}
