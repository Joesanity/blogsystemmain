import router from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";
import withAuth, { withAuthGetServerSideProps } from "~/components/hoc/withAuth";

function BlogsToReview() {
  const { data: blogsToReview, isLoading, isError } = api.generate.getBlogsToReview.useQuery();
  const acceptBlogPostMutation = api.generate.acceptBlogPost.useMutation();
  const rejectBlogPostMutation = api.generate.rejectBlogPost.useMutation();

  const [loadingBlogId, setLoadingBlogId] = useState<number | null>(null);
  const [isAcceptingAll, setIsAcceptingAll] = useState<boolean>(false);
  const [isRejectingAll, setIsRejectingAll] = useState<boolean>(false);

  const handleAccept = async (blogId: number) => {
    setLoadingBlogId(blogId);
    try {
      await acceptBlogPostMutation.mutateAsync(blogId);
      alert("Blog post accepted!");
      router.reload();
    } catch (error) {
      console.error("Failed to accept blog post:", error);
      alert("Failed to accept blog post. Please try again.");
    } finally {
      setLoadingBlogId(null);
    }
  };

  const handleReject = async (blogId: number) => {
    setLoadingBlogId(blogId);
    try {
      await rejectBlogPostMutation.mutateAsync(blogId);
      alert("Blog post rejected!");
      router.reload();
    } catch (error) {
      console.error("Failed to reject blog post:", error);
      alert("Failed to reject blog post. Please try again.");
    } finally {
      setLoadingBlogId(null);
    }
  };

  const handleAcceptAll = async () => {
    if (!blogsToReview) return; // Ensure blogsToReview is not undefined

    setIsAcceptingAll(true);
    try {
      for (const blog of blogsToReview) {
        await acceptBlogPostMutation.mutateAsync(blog.id);
      }
      alert("All blog posts accepted!");
      router.reload();
    } catch (error) {
      console.error("Failed to accept all blog posts:", error);
      alert("Failed to accept all blog posts. Please try again.");
    } finally {
      setIsAcceptingAll(false);
    }
  };

  const handleRejectAll = async () => {
    if (!blogsToReview) return; // Ensure blogsToReview is not undefined

    setIsRejectingAll(true);
    try {
      for (const blog of blogsToReview) {
        await rejectBlogPostMutation.mutateAsync(blog.id);
      }
      alert("All blog posts rejected!");
      router.reload();
    } catch (error) {
      console.error("Failed to reject all blog posts:", error);
      alert("Failed to reject all blog posts. Please try again.");
    } finally {
      setIsRejectingAll(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error occurred</div>;

  return (
    <div className="px-8 py-8">
      <h1 className="mb-4 text-2xl font-bold">Blogs to Review</h1>
      {blogsToReview && blogsToReview.length > 0 ? (
        <>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleAcceptAll}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={isAcceptingAll}
            >
              {isAcceptingAll ? "Accepting..." : "Accept All"}
            </button>
            <button
              onClick={handleRejectAll}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              disabled={isRejectingAll}
            >
              {isRejectingAll ? "Rejecting..." : "Reject All"}
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {blogsToReview.map((blog) => (
                <tr key={blog.id}>
                  <td className="break-all px-6 py-4 text-sm text-gray-500">{blog.website.url}</td>
                  <td className="break-all px-6 py-4 text-sm text-gray-500">
                    <div className="formatted-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
                  </td>
                  <td className="break-all px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-col space-x-4 items-center">
                      <button
                        onClick={() => handleAccept(blog.id)}
                        className="w-[100px] px-4 py-2 text-sm text-white bg-blue-700 text-center cursor-pointer rounded"
                        disabled={loadingBlogId === blog.id}
                      >
                        {loadingBlogId === blog.id ? (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          "Accept"
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(blog.id)}
                        className="w-[100px] px-4 py-2 text-sm text-white bg-red-600 text-center cursor-pointer rounded"
                        disabled={loadingBlogId === blog.id}
                      >
                        {loadingBlogId === blog.id ? (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          "Reject"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div>No blogs to review</div>
      )}
    </div>
  );
}

export const getServerSideProps = withAuthGetServerSideProps();

export default BlogsToReview;
