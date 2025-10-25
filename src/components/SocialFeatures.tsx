import React, { useState, useEffect } from 'react';
import { 
  BookRecommendation, 
  ReadingGroup, 
  BookShare, 
  ReadingChallenge, 
  Book 
} from '../types';
import { socialService } from '../services/socialService';

interface SocialFeaturesProps {
  books: Book[];
  onClose: () => void;
}

const SocialFeatures: React.FC<SocialFeaturesProps> = ({ books, onClose }) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'groups' | 'shares' | 'challenges'>('recommendations');
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [readingGroups, setReadingGroups] = useState<ReadingGroup[]>([]);
  const [bookShares, setBookShares] = useState<BookShare[]>([]);
  const [challenges, setChallenges] = useState<ReadingChallenge[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showShareBook, setShowShareBook] = useState(false);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    const [recs, groups, shares, chals] = await Promise.all([
      socialService.getRecommendations(),
      socialService.getReadingGroups(),
      socialService.getBookShares(),
      socialService.getChallenges()
    ]);
    
    setRecommendations(recs);
    setReadingGroups(groups);
    setBookShares(shares);
    setChallenges(chals);
  };

  const handleGenerateRecommendations = async () => {
    const newRecommendations = await socialService.generateRecommendations(books);
    setRecommendations(prev => [...prev, ...newRecommendations]);
  };

  const handleMarkRecommendationAsRead = async (recommendationId: string) => {
    await socialService.markRecommendationAsRead(recommendationId);
    setRecommendations(prev => 
      prev.map(rec => rec.id === recommendationId ? { ...rec, isRead: true } : rec)
    );
  };

  const handleJoinGroup = async (groupId: string) => {
    await socialService.joinReadingGroup(groupId, 'current-user');
    await loadSocialData();
  };

  const handleLikeShare = async (shareId: string) => {
    await socialService.likeBookShare(shareId, 'current-user');
    await loadSocialData();
  };

  const handleJoinChallenge = async (challengeId: string) => {
    await socialService.joinChallenge(challengeId, 'current-user');
    await loadSocialData();
  };

  return (
    <div className="social-features">
      <div className="modal-header">
        <h2>🌟 Social Features</h2>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="social-tabs">
        <button 
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          📚 Recommendations
        </button>
        <button 
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          👥 Reading Groups
        </button>
        <button 
          className={`tab ${activeTab === 'shares' ? 'active' : ''}`}
          onClick={() => setActiveTab('shares')}
        >
          📤 Book Shares
        </button>
        <button 
          className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          🏆 Challenges
        </button>
      </div>

      <div className="social-content">
        {activeTab === 'recommendations' && (
          <div className="recommendations-section">
            <div className="section-header">
              <h3>📚 Book Recommendations</h3>
              <button 
                className="btn btn-primary"
                onClick={handleGenerateRecommendations}
              >
                Generate AI Recommendations
              </button>
            </div>
            
            {recommendations.length === 0 ? (
              <div className="empty-state">
                <p>No recommendations yet. Generate some AI-powered recommendations based on your reading history!</p>
              </div>
            ) : (
              <div className="recommendations-list">
                {recommendations.map(rec => (
                  <div key={rec.id} className={`recommendation-card ${rec.isRead ? 'read' : ''}`}>
                    <div className="recommendation-content">
                      <h4>Book Recommendation</h4>
                      <p className="recommendation-reason">{rec.reason}</p>
                      <div className="recommendation-meta">
                        <span className="confidence">
                          Confidence: {Math.round(rec.confidence * 100)}%
                        </span>
                        <span className="recommended-by">
                          Recommended by: {rec.recommendedBy}
                        </span>
                      </div>
                    </div>
                    <div className="recommendation-actions">
                      {!rec.isRead && (
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={() => handleMarkRecommendationAsRead(rec.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                      {rec.isRead && (
                        <span className="read-badge">✅ Read</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="groups-section">
            <div className="section-header">
              <h3>👥 Reading Groups</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateGroup(true)}
              >
                Create Group
              </button>
            </div>
            
            {readingGroups.length === 0 ? (
              <div className="empty-state">
                <p>No reading groups yet. Create a group to read books together with friends!</p>
              </div>
            ) : (
              <div className="groups-list">
                {readingGroups.map(group => (
                  <div key={group.id} className="group-card">
                    <div className="group-header">
                      <h4>{group.name}</h4>
                      <span className={`group-status ${group.isActive ? 'active' : 'inactive'}`}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="group-description">{group.description}</p>
                    <div className="group-meta">
                      <span>👥 {group.members.length} members</span>
                      <span>📚 {group.books.length} books</span>
                      <span>📅 Started {new Date(group.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="group-actions">
                      <button 
                        className="btn btn-primary btn-small"
                        onClick={() => handleJoinGroup(group.id)}
                      >
                        Join Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'shares' && (
          <div className="shares-section">
            <div className="section-header">
              <h3>📤 Book Shares</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowShareBook(true)}
              >
                Share a Book
              </button>
            </div>
            
            {bookShares.length === 0 ? (
              <div className="empty-state">
                <p>No book shares yet. Share your favorite books with the community!</p>
              </div>
            ) : (
              <div className="shares-list">
                {bookShares.map(share => (
                  <div key={share.id} className="share-card">
                    <div className="share-header">
                      <h4>Book Share</h4>
                      <span className="share-date">
                        {new Date(share.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="share-message">{share.message}</p>
                    <div className="share-actions">
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={() => handleLikeShare(share.id)}
                      >
                        ❤️ {share.likes.length}
                      </button>
                      <span className="share-comments">
                        💬 {share.comments.length} comments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="challenges-section">
            <div className="section-header">
              <h3>🏆 Reading Challenges</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateChallenge(true)}
              >
                Create Challenge
              </button>
            </div>
            
            {challenges.length === 0 ? (
              <div className="empty-state">
                <p>No challenges yet. Create a reading challenge to motivate yourself and others!</p>
              </div>
            ) : (
              <div className="challenges-list">
                {challenges.map(challenge => (
                  <div key={challenge.id} className="challenge-card">
                    <div className="challenge-header">
                      <h4>{challenge.title}</h4>
                      <span className={`challenge-status ${challenge.isPublic ? 'public' : 'private'}`}>
                        {challenge.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <p className="challenge-description">{challenge.description}</p>
                    <div className="challenge-meta">
                      <span>🎯 Target: {challenge.target} {challenge.type}</span>
                      <span>👥 {challenge.participants.length} participants</span>
                      <span>📅 {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="challenge-actions">
                      <button 
                        className="btn btn-primary btn-small"
                        onClick={() => handleJoinChallenge(challenge.id)}
                      >
                        Join Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <CreateGroupModal 
              onClose={() => setShowCreateGroup(false)}
              onGroupCreated={() => {
                setShowCreateGroup(false);
                loadSocialData();
              }}
            />
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateChallenge && (
        <div className="modal-overlay" onClick={() => setShowCreateChallenge(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <CreateChallengeModal 
              onClose={() => setShowCreateChallenge(false)}
              onChallengeCreated={() => {
                setShowCreateChallenge(false);
                loadSocialData();
              }}
            />
          </div>
        </div>
      )}

      {/* Share Book Modal */}
      {showShareBook && (
        <div className="modal-overlay" onClick={() => setShowShareBook(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <ShareBookModal 
              books={books}
              onClose={() => setShowShareBook(false)}
              onBookShared={() => {
                setShowShareBook(false);
                loadSocialData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Create Group Modal Component
interface CreateGroupModalProps {
  onClose: () => void;
  onGroupCreated: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onGroupCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await socialService.createReadingGroup({
      ...formData,
      members: ['current-user'],
      books: [],
      isActive: true,
      createdBy: 'current-user',
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate)
    });
    onGroupCreated();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create Reading Group</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="group-form">
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Challenge Modal Component
interface CreateChallengeModalProps {
  onClose: () => void;
  onChallengeCreated: () => void;
}

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ onClose, onChallengeCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'books' as 'books' | 'pages' | 'genres' | 'authors' | 'time',
    target: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isPublic: true,
    rewards: '',
    rules: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await socialService.createChallenge({
      ...formData,
      target: Number(formData.target),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      rewards: formData.rewards.split(',').map(r => r.trim()).filter(Boolean),
      rules: formData.rules.split(',').map(r => r.trim()).filter(Boolean),
      createdBy: 'current-user'
    });
    onChallengeCreated();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create Reading Challenge</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="challenge-form">
          <div className="form-group">
            <label>Challenge Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Challenge Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="books">Books</option>
                <option value="pages">Pages</option>
                <option value="genres">Genres</option>
                <option value="authors">Authors</option>
                <option value="time">Reading Time</option>
              </select>
            </div>
            <div className="form-group">
              <label>Target</label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: Number(e.target.value)})}
                min="1"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
              />
              Public Challenge
            </label>
          </div>
          <div className="form-group">
            <label>Rewards (comma-separated)</label>
            <input
              type="text"
              value={formData.rewards}
              onChange={(e) => setFormData({...formData, rewards: e.target.value})}
              placeholder="e.g., Badge, Certificate, Gift Card"
            />
          </div>
          <div className="form-group">
            <label>Rules (comma-separated)</label>
            <input
              type="text"
              value={formData.rules}
              onChange={(e) => setFormData({...formData, rules: e.target.value})}
              placeholder="e.g., Must be fiction, Must be 200+ pages"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Share Book Modal Component
interface ShareBookModalProps {
  books: Book[];
  onClose: () => void;
  onBookShared: () => void;
}

const ShareBookModal: React.FC<ShareBookModalProps> = ({ books, onClose, onBookShared }) => {
  const [formData, setFormData] = useState({
    bookId: '',
    message: '',
    isPublic: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await socialService.shareBook({
      ...formData,
      sharedBy: 'current-user'
    });
    onBookShared();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Share a Book</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="share-form">
          <div className="form-group">
            <label>Select Book</label>
            <select
              value={formData.bookId}
              onChange={(e) => setFormData({...formData, bookId: e.target.value})}
              required
            >
              <option value="">Choose a book...</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Share Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={3}
              placeholder="Why do you recommend this book?"
              required
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
              />
              Public Share
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Share Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialFeatures;
