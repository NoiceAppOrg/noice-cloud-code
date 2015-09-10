
// method for doing initial upvote/downvote counts (need to change a couple params)
// Parse.Cloud.define("updateVoteCounts", function(request, response) {
//   query = new Parse.Query("Video");
//   query.find({
//     success: function(videos) {
//       callbacks = 0;
//       for (i in videos) {
//        video = videos[i];
//        countQuery = new Parse.Query("Vote");
//        countQuery.equalTo("video", video);
//        countQuery.equalTo("value", -1);
//        countQuery.count((function(video) { return {
//      success: function(count) {
//        video.set("downVotes", count);
//        Parse.Cloud.useMasterKey();
//          video.save({
//            success: function(foo) {
//              callbacks++;
//              if (callbacks == videos.length) {
//                response.success("Successfully updated vote counts");
//              }
//            },
//            error: function(bar) {

//            }
//          });
//      },
//      error: function(error) {
//        console.log("Got an error " + error.code + " : " + error.message);
//      }
//        }})(video));
//       }
//     },
//     error: function(error) {
//       response.success("Got an error " + error.code + " : " + error.message);
//     }
//   });
// });

// initial share counts for videos
// Parse.Cloud.define("updateShareCounts", function(request, response) {
//   query = new Parse.Query("Video");
//   query.find({
//     success: function(videos) {
//       callbacks = 0;
//       for (i in videos) {
//        video = videos[i];
//        countQuery = new Parse.Query("Share");
//        countQuery.equalTo("video", video);
//        countQuery.count((function(video) { return {
//      success: function(count) {
//        video.set("shareCount", count);
//        Parse.Cloud.useMasterKey();
//          video.save({
//            success: function(foo) {
//              callbacks++;
//              if (callbacks == videos.length) {
//                response.success("Successfully updated share counts");
//              }
//            },
//            error: function(bar) {

//            }
//          });
//      },
//      error: function(error) {
//        console.log("Got an error " + error.code + " : " + error.message);
//      }
//        }})(video));
//       }
//     },
//     error: function(error) {
//       response.success("Got an error " + error.code + " : " + error.message);
//     }
//   });
// });


// hook to update video count after vote
Parse.Cloud.afterSave("Vote", function(request, response) {
  vote = request.object;
  upVoteChange = 0;
  downVoteChange = 0;
  if (vote.get("value") == 1) {
    upVoteChange = 1;
  } else if (vote.get("value") == -1) {
    downVoteChange = 1;
  }

  // if created and update times don't match, then this vote swapped value
  if (vote.get("updatedAt").getTime() != vote.get("createdAt").getTime()) {
    if (upVoteChange != 0) {
      downVoteChange = -1;
    } else if (downVoteChange != 0) {
      upVoteChange = -1;
    }
  }

  query = new Parse.Query("Video");
  query.get(request.object.get("video").id, {
    success: function(video) {
      if (video.get("upVotes") === undefined) {
        video.set("upVotes", 0);
      }
      if (video.get("downVotes") === undefined) {
        video.set("downVotes", 0);
      }
      video.increment("upVotes", upVoteChange);
      video.increment("downVotes", downVoteChange);
      Parse.Cloud.useMasterKey();
      video.save();
    },
    error: function(error) {
      console.error("Got an error " + error.code + " : " + error.message);
    }
  });
});

// hook to update video share count after share
Parse.Cloud.afterSave("Share", function(request, response) {
  query = new Parse.Query("Video");
  query.get(request.object.get("video").id, {
    success: function(video) {
      video.increment("shareCount");
      Parse.Cloud.useMasterKey();
      video.save();
    },
    error: function(error) {
      console.error("Got an error " + error.code + " : " + error.message);
    }
  });
});